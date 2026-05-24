'use server';

import { GoogleAuth } from 'google-auth-library';
import { sheets_v4 } from '@googleapis/sheets';
import { FeedbackFormData, feedbackFormSchema } from "@/app/zfdschema";
import sendTelegramMessage from "@/app/tgmessage";

export async function submitFeedbackForm(_prevState: FeedbackFormData, formData: FormData): Promise<FeedbackFormData> {
    const data = {
        name: formData.get('name') as string,
        text: formData.get('text') as string,
        tour: formData.get('tour') as string,
        tourId: formData.get('tourId') as string,
        date: formData.get('date') as string,
    };

    const validated = feedbackFormSchema.safeParse(data);

    if (!validated.success) {
        console.error('Feedback validation failed:', validated.error.issues[0]);
        return { ...data, success: false, errMessage: validated.error.issues[0].message };
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
        const { name, tour, tourId, date, text } = validated.data;

        sendTelegramMessage(`New feedback from ${name} for "${tour}"`).catch((error) => {
            console.error('Telegram notification failed:', error);
        });

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Reviews!A:F',
            valueInputOption: 'RAW',
            requestBody: {
                values: [[name, tour, tourId, date, '', text]],
            },
        });

        return { ...validated.data, success: true, errMessage: '' };

    } catch (error) {
        console.error('Error submitting to Google Sheets:', error);
        return { ...validated.data, success: false, errMessage: 'Submission failed. Please try again.' };
    }
}
