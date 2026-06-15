import { GoogleAuth } from 'google-auth-library';
import { sheets_v4 } from '@googleapis/sheets';
import { Review } from 'types/review';
import { unstable_cache } from "next/cache";

async function fetchFromGoogle(): Promise<Review[]> {
    console.log('Fetching fresh reviews from Google Sheets...');

    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    if (!clientEmail || !privateKey || !spreadsheetId) {
        console.error('Missing required Google Sheets environment variables');
        return [];
    }

    let rawData: string[][];
    try {
        const auth = new GoogleAuth({
            credentials: { client_email: clientEmail, private_key: privateKey },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const sheets = new sheets_v4.Sheets({ auth });
        rawData = (await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Reviews!A:F',
        })).data.values || [];
    } catch (error) {
        console.error('Error reading from Google Sheets:', error);
        return [];
    }

    return convertToReviews(rawData).sort((a, b) => a.tourDate < b.tourDate ? 1 : -1);
}

function convertToReviews(values: string[][]): Review[] {
    if (!values.length) return [];
    return values.slice(1)
        .map((row, index): Review => ({
            id: index.toString(),
            tourProgramId: row[2] ?? '',
            tourEventId: '',
            tourDate: row[3] ?? '',
            reviewer: row[0] ?? '',
            link: '',
            image: '',
            text: (row[4] ?? '').length > 0 ? (row[5] ?? '') : '',
        }))
        .filter((review) => review.text.length > 0);
}

export const getAllReviews = unstable_cache(
    fetchFromGoogle,
    ['reviews-v2'],
    { revalidate: 3600 }
);
