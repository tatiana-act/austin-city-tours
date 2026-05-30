'use server';

import { GoogleAuth } from 'google-auth-library';
import { sheets_v4 } from '@googleapis/sheets';
import { ContactFormData, contactFormSchema } from '../zschema';
import sendTelegramMessage from "@/app/tgmessage";

export async function submitContactForm(_prevState: ContactFormData, formData: FormData): Promise<ContactFormData> {
    const data = {
        name: formData.get('name') as string,
        email: formData.get('email') as string | undefined,
        phone: formData.get('phone') as string | undefined,
        whatsapp: formData.get('whatsapp') === 'on',
        telegram: formData.get('telegram') as string | undefined,
        tour: formData.get('tour') as string | undefined,
    };

    const validated = contactFormSchema.safeParse(data);

    if (!validated.success) {
        console.error('Contact validation failed:', validated.error.issues[0]);
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
        const { name, phone, telegram, whatsapp, email, tour } = validated.data;

        const fmtTelegram = telegram && !telegram.startsWith('@') ? `@${telegram}` : (telegram ?? '');

        sendTelegramMessage(
            `New contact from ${name}: ${phone ?? ''} ${fmtTelegram}`.trim()
        ).catch((error) => {
            console.error('Telegram notification failed:', error);
        });

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Contacts!A:F',
            valueInputOption: 'RAW',
            requestBody: {
                values: [[name, email ?? '', phone ?? '', fmtTelegram, whatsapp ? 'Yes' : 'No', tour ?? '']],
            },
        });

        return { ...validated.data, success: true, errMessage: '' };

    } catch (error) {
        console.error('Error submitting to Google Sheets:', error);
        return { ...validated.data, success: false, errMessage: 'Submission failed. Please try again.' };
    }
}
