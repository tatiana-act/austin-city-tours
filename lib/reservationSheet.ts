import { GoogleAuth } from 'google-auth-library';
import { sheets_v4 } from '@googleapis/sheets';
import { programTitle } from '@/lib/programTitle';
import type { Reservation, ReservationLocale, ReservationStatus } from '@/types/reservation';

/**
 * The `Reservations` tab of the production spreadsheet (architecture §2.3).
 * Header in row 1, one row per reservation from row 2:
 *
 *   A booking id | B name | C tour (EN) | D date | E guests | F amount | G email |
 *   H status page | I status | J program | K event | L language | M payment | N created
 *
 * Only the site writes the tab [54]; the only cell ever changed after append is I.
 * Every function throws on a missing configuration or an API failure — the
 * callers decide what a failure means (webhook: retry; status page: 5xx).
 * Own `GoogleAuth` setup: the existing actions are not refactored (§3).
 */
const TAB = 'Reservations';
const STATUS_COLUMN = 'I';

function sheetsClient(): { sheets: sheets_v4.Sheets; spreadsheetId: string } {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!clientEmail || !privateKey || !spreadsheetId) {
    throw new Error('Missing required Google Sheets environment variables');
  }
  const auth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return { sheets: new sheets_v4.Sheets({ auth }), spreadsheetId };
}

function text(cell: unknown): string {
  return cell === undefined || cell === null ? '' : String(cell);
}

function toStatus(cell: unknown): ReservationStatus {
  return text(cell).trim() === 'not valid' ? 'not valid' : 'valid';
}

function toLocale(cell: unknown): ReservationLocale {
  return text(cell).trim() === 'ru' ? 'ru' : 'en';
}

function rowToReservation(row: unknown[]): Reservation {
  return {
    id: text(row[0]),
    name: text(row[1]),
    date: text(row[3]),
    guests: Number(row[4]) || 0,
    amountUsd: Number(row[5]) || 0,
    email: text(row[6]),
    status: toStatus(row[8]),
    programId: text(row[9]),
    eventId: text(row[10]),
    locale: toLocale(row[11]),
    paymentIntentId: text(row[12]),
    createdAt: text(row[13]),
  };
}

/** The row of a booking id (1-based sheet row number), or null when the tab has none. */
export async function findReservation(
  id: string,
): Promise<{ row: number; reservation: Reservation } | null> {
  const { sheets, spreadsheetId } = sheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${TAB}!A:N`,
    valueRenderOption: 'UNFORMATTED_VALUE',
  });
  const rows: unknown[][] = response.data.values ?? [];
  // Row 1 is the header.
  for (let i = 1; i < rows.length; i += 1) {
    if (text(rows[i][0]) === id) return { row: i + 1, reservation: rowToReservation(rows[i]) };
  }
  return null;
}

/**
 * Appends one row. `statusUrl` is column H, the URL the QR encodes (§4.5); it is
 * passed in because it depends on the request's origin when `PILOT_SHARE_URL`
 * is absent.
 */
export async function appendReservation(r: Reservation, statusUrl: string): Promise<void> {
  const { sheets, spreadsheetId } = sheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${TAB}!A:N`,
    // A name beginning with `=` stays text.
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [
        [
          r.id,
          r.name,
          programTitle(r.programId, 'en'),
          r.date,
          r.guests,
          r.amountUsd,
          r.email,
          statusUrl,
          r.status,
          r.programId,
          r.eventId,
          r.locale,
          r.paymentIntentId,
          r.createdAt,
        ],
      ],
    },
  });
}

/** Sets column I of `row` to `not valid` (chargeback, [52]). */
export async function setNotValid(row: number): Promise<void> {
  const { sheets, spreadsheetId } = sheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${TAB}!${STATUS_COLUMN}${row}`,
    valueInputOption: 'RAW',
    requestBody: { values: [['not valid']] },
  });
}
