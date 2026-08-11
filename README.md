# Austin City Tours

A modern Next.js web application for booking and discovering city tours in Austin. Built with React 19, TypeScript, Tailwind CSS, and next-intl for internationalization (en/ru). Includes integrations with Google Sheets to store booking, contact, and feedback submissions.

---

## Local Development & Testing

To run the application locally on your machine, follow these steps:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your environment variables:**
   Create a `.env.local` file in the root directory and populate it with the required keys (see [Environment Variables](#environment-variables) below).

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **View the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser. The page will auto-update as you edit the files.

---

## Environment Variables

This project relies on a few secure environment variables to function correctly, particularly for integrating with the Google Sheets API.
You have to create a Google Spreadsheet and share it with a service account. The spreadsheet must have 3 sheets named `Contacts`, `Reviews` and `Bookings`, with the exact column layout described in [The spreadsheet](#the-spreadsheet) below — the code addresses columns by position, so a sheet with the right name but different columns will be read incorrectly.
Create a `.env.local` file with the following keys for local development, and ensure these are added to your hosting provider for production:

```env
# Google Service Account Email
GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account-email@your-project.iam.gserviceaccount.com"

# Google Service Account Private Key (make sure to format newlines correctly if pasting inline)
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# The specific ID of the Google Spreadsheet to use as your database
GOOGLE_SHEETS_SPREADSHEET_ID="your_spreadsheet_id_here"
```
This project uses Telegram messages for live notifications about bookings ands feedbacks. To receive messages you need to configure the Telegram Bot, and start Bot from a regular Telegram account, otherwise notifications will not be delivered  

```env
# Telegram Bot Token
TELEGRAM_BOT_TOKEN="token (number:string)"

# Chat id for live notifications
TELEGRAM_BOT_CHATID="telegram chat id (number)"
```
---

## The spreadsheet

The spreadsheet is not a free-form log: **every column is addressed by position**, so
inserting, reordering or removing a column silently changes what the site reads and
writes. The layouts below are the contract.

### `Bookings` — written by the "Book a tour" form (`app/actions/bookTour.ts`)

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| tour id | requested date | name | contact | group size | submitted at | tour name | extra notes |

### `Contacts` — written by the "Reserve" / "Join this tour" form (`app/actions/submitContact.ts`)

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| name | email | phone | telegram (`@` added if missing) | uses WhatsApp — `Yes` / `No` | tour name |

### `Reviews` — written by the review form, **and read back onto the site**

Written by `app/actions/sendFeedback.ts`, read by `app/actions/readAllFeedbacks.ts`:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| author name | tour name | tour **program** id | tour date | **publish flag** | review text |

Four things about this sheet are easy to get wrong:

1. **Column E is a manual publish flag, and this is deliberate.** The form always
   writes E empty, and the site only shows a review whose E is non-empty. A new
   review therefore lands in the sheet invisible to visitors until someone puts
   something — anything non-empty — in E. This is the moderation step; it is not a
   bug to be fixed.
2. **Row 1 is always skipped as a header.** If the sheet has no header row, the
   first review is silently discarded.
3. **Column C must hold a program id** (`Acap`, `Haust`, `Gcrt`, … — see
   `data/tours.ts`), not a tour title. On a mismatch the review still renders, but
   with no tour name and no author name, because both are tied to resolving that id.
4. **Reviews are cached for an hour** (`unstable_cache`, `revalidate: 3600`). After
   flipping the publish flag, the review can take up to an hour to appear. Reloading
   the page does not speed this up.

Reviews are ordered by column D, newest first.

---

## Deployment to Vercel

The easiest way to deploy this Next.js app is to use [Vercel](https://vercel.com/), built by the creators of Next.js.

### Steps to Deploy:

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket).
2. **Import the project into Vercel:**
   * Go to your Vercel dashboard and click **Add New... > Project**.
   * Connect your Git account and import the relevant repository.
3. **Configure the Project:**
   * During the import step, open the **Environment Variables** section.
   * Add **all five** variables from [Environment Variables](#environment-variables) identically to your `.env.local` file: `GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`, `GOOGLE_SHEETS_SPREADSHEET_ID`, `TELEGRAM_BOT_TOKEN` and `TELEGRAM_BOT_CHATID`.
   * The Telegram pair is easy to skip, and skipping it fails quietly: submissions still reach the spreadsheet and the visitor still sees a success message, but no notification is ever delivered.
4. **Deploy:**
   * Click **Deploy**. Vercel will automatically detect that it is a Next.js application, build it, and assign a live URL.
   * For subsequent changes, Vercel will automatically redeploy whenever you push to your main branch.

For more detailed information, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
