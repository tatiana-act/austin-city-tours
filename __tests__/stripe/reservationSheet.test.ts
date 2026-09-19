/**
 * @jest-environment node
 */
/// <reference types="jest" />
import { appendReservation, findReservation, setNotValid } from '@/lib/reservationSheet';
import type { Reservation } from '@/types/reservation';

const mockGet = jest.fn();
const mockAppend = jest.fn();
const mockUpdate = jest.fn();

jest.mock('google-auth-library', () => ({ GoogleAuth: jest.fn() }));
jest.mock('@googleapis/sheets', () => ({
  sheets_v4: {
    Sheets: jest.fn(() => ({
      spreadsheets: { values: { get: mockGet, append: mockAppend, update: mockUpdate } },
    })),
  },
}));

const ENV = {
  GOOGLE_SHEETS_CLIENT_EMAIL: 'svc@example.iam.gserviceaccount.com',
  GOOGLE_SHEETS_PRIVATE_KEY: 'key\\nline',
  GOOGLE_SHEETS_SPREADSHEET_ID: 'sheet-id',
};
const saved = { ...process.env };

const ID = '3f1c2a9e-5b7d-4c1e-9a2b-7d6e5f4a3b2c';
const reservation: Reservation = {
  id: ID,
  name: '=HYPERLINK("x")',
  programId: 'Acap',
  eventId: 'tour77',
  date: '2026-09-22',
  guests: 3,
  amountUsd: 120,
  email: 'payer@example.com',
  locale: 'ru',
  status: 'valid',
  paymentIntentId: 'pi_1',
  createdAt: '2026-09-20T17:00:00.000Z',
};

beforeEach(() => {
  Object.assign(process.env, ENV);
  mockGet.mockReset();
  mockAppend.mockReset();
  mockUpdate.mockReset();
});
afterAll(() => {
  process.env = saved;
});

describe('Reservations tab (architecture §2.3)', () => {
  it('appends one RAW row with columns A–N in order', async () => {
    mockAppend.mockResolvedValue({});
    await appendReservation(reservation, 'https://pilot/ru/bookingstatus/x/?_vercel_share=T');
    expect(mockAppend).toHaveBeenCalledWith({
      spreadsheetId: 'sheet-id',
      range: 'Reservations!A:N',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [
          [
            ID,
            '=HYPERLINK("x")',
            'Walking tour of downtown Austin',
            '2026-09-22',
            3,
            120,
            'payer@example.com',
            'https://pilot/ru/bookingstatus/x/?_vercel_share=T',
            'valid',
            'Acap',
            'tour77',
            'ru',
            'pi_1',
            '2026-09-20T17:00:00.000Z',
          ],
        ],
      },
    });
  });

  it('finds a row by booking id, skipping the header, with its sheet row number', async () => {
    mockGet.mockResolvedValue({
      data: {
        values: [
          ['booking id', 'name'],
          ['other-id', 'X'],
          [ID, 'Anna', 'Walking tour', '2026-09-22', 3, 120, 'e@x', 'url', 'not valid', 'Acap', 'tour77', 'ru', 'pi_1', 'ts'],
        ],
      },
    });
    const found = await findReservation(ID);
    expect(found?.row).toBe(3);
    expect(found?.reservation).toMatchObject({
      id: ID,
      name: 'Anna',
      guests: 3,
      programId: 'Acap',
      date: '2026-09-22',
      locale: 'ru',
      status: 'not valid',
    });
  });

  it('returns null for an id the tab does not have, including an empty tab', async () => {
    mockGet.mockResolvedValue({ data: { values: [['booking id']] } });
    await expect(findReservation(ID)).resolves.toBeNull();
    mockGet.mockResolvedValue({ data: {} });
    await expect(findReservation(ID)).resolves.toBeNull();
  });

  it('throws when the sheet cannot be read or is not configured', async () => {
    mockGet.mockRejectedValue(new Error('403'));
    await expect(findReservation(ID)).rejects.toThrow('403');
    delete process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    await expect(findReservation(ID)).rejects.toThrow('Missing required Google Sheets');
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('changes only column I of the row on a chargeback', async () => {
    mockUpdate.mockResolvedValue({});
    await setNotValid(7);
    expect(mockUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'sheet-id',
      range: 'Reservations!I7',
      valueInputOption: 'RAW',
      requestBody: { values: [['not valid']] },
    });
  });
});
