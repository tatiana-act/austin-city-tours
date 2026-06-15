'use server';

import { GoogleAuth } from 'google-auth-library';
import { sheets_v4 } from '@googleapis/sheets';
import { BookingFormData, getBookingFormSchema } from "@/app/zbkschema";
import sendTelegramMessage from "@/app/tgmessage";

export async function submitBookingForm(_prevState: BookingFormData, formData: FormData): Promise<BookingFormData> {
    const data = {
        tourId: formData.get('tourId') as string,
        date: formData.get('date') as string,
        name: formData.get('name') as string,
        contact: formData.get('contact') as string,
        groupSize: Number(formData.get('groupSize')) || 0,
        created: formData.get('created') as string,
        tour: formData.get('tour') as string,
        extra: formData.get('extra') as string
    };

    const validated = getBookingFormSchema(null).safeParse(data);

    if (!validated.success) {
        console.error('Booking validation failed:', validated.error.issues[0]);
        return {
            ...data,
            groupSize: data.groupSize || 0,
            success: false,
            errMessage: validated.error.issues[0].message,
        };
    }

    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    if (!clientEmail || !privateKey || !spreadsheetId) {
        console.error('Missing required Google Sheets environment variables');
        return { ...validated.data, success: false, errMessage: 'Submission failed. Please try again.' };
    }

    try {
        const auth = new GoogleAuth({
            credentials: { client_email: clientEmail, private_key: privateKey },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = new sheets_v4.Sheets({ auth });

        const { name, contact, tour, groupSize, date, tourId, created, extra } = validated.data;

        sendTelegramMessage(
            `New booking from ${name} / ${contact}: ${tour} for group of ${groupSize} on ${date}`
        ).catch((error) => {
            console.error('Telegram notification failed:', error);
        });

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Bookings!A:H',
            valueInputOption: 'RAW',
            requestBody: {
                values: [[tourId, date, name, contact, groupSize, created, tour, extra]],
            },
        });

        return { ...validated.data, success: true, errMessage: '' };

    } catch (error) {
        console.error('Error submitting to Google Sheets:', error);
        return { ...validated.data, success: false, errMessage: 'Submission failed. Please try again.' };
    }
}
