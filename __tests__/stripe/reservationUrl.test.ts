/**
 * @jest-environment node
 */
/// <reference types="jest" />
import { requestOrigin, statusPageUrl } from '@/lib/reservationUrl';

const ID = '3f1c2a9e-5b7d-4c1e-9a2b-7d6e5f4a3b2c';

describe('statusPageUrl (architecture §4.5)', () => {
  const saved = process.env.PILOT_SHARE_URL;
  afterEach(() => {
    if (saved === undefined) delete process.env.PILOT_SHARE_URL;
    else process.env.PILOT_SHARE_URL = saved;
  });

  it('uses the origin and every query parameter of PILOT_SHARE_URL', () => {
    process.env.PILOT_SHARE_URL = 'https://pilot-branch.vercel.app/?_vercel_share=TOKEN123';
    expect(statusPageUrl('ru', ID, 'https://other-host.example')).toBe(
      `https://pilot-branch.vercel.app/ru/bookingstatus/${ID}/?_vercel_share=TOKEN123`,
    );
  });

  it("falls back to the request's origin when the variable is absent", () => {
    delete process.env.PILOT_SHARE_URL;
    expect(statusPageUrl('en', ID, 'http://localhost:3000')).toBe(
      `http://localhost:3000/en/bookingstatus/${ID}/`,
    );
  });

  it('throws on a PILOT_SHARE_URL that is not a URL', () => {
    process.env.PILOT_SHARE_URL = 'not a url';
    expect(() => statusPageUrl('en', ID, 'http://localhost:3000')).toThrow();
  });
});

describe('requestOrigin', () => {
  it('combines x-forwarded-proto and host', () => {
    const headers = new Headers({ host: 'pilot.vercel.app', 'x-forwarded-proto': 'https' });
    expect(requestOrigin(headers)).toBe('https://pilot.vercel.app');
  });
  it('defaults to http on localhost', () => {
    expect(requestOrigin(new Headers({ host: 'localhost:3000' }))).toBe('http://localhost:3000');
  });
});
