---
name: nextjs-ssr
description: Best practices for Next.js App Router, Server Components, data fetching, and server actions. Use when building or reviewing any page, layout, server action, or data fetching logic.
---

# Next.js App Router Best Practices

## Server Components Are the Default

Every component is a Server Component unless it explicitly needs the client. A component needs `"use client"` only if it uses:
- Event handlers (`onClick`, `onChange`, etc.)
- Browser APIs (`window`, `localStorage`, `document`)
- React hooks (`useState`, `useEffect`, `useRef`, etc.)
- Third-party libraries that depend on the above

If a component only renders markup from props or async data, it should be a Server Component — no directive needed.

**Common mistake**: marking a whole page or section `"use client"` because one small child needs interactivity. Instead, push `"use client"` down to the smallest possible leaf component. Keep the parent a Server Component.

## Data Fetching

Fetch data as close to where it's used as possible — in the Server Component that renders it.

```tsx
// Good: fetch in the server component that needs it
export default async function ToursSection() {
  const tours = await getTours(); // async function, runs on server
  return <TourList tours={tours} />;
}
```

- Never fetch in `useEffect` what can be fetched in a Server Component
- Do not pass server data through many layers of props — fetch it where it's consumed
- Use `cache()` from React for request deduplication when the same data is fetched in multiple components during one render

## Streaming and Suspense

Wrap slow data fetches in `<Suspense>` to avoid blocking the entire page:

```tsx
export default function Page() {
  return (
    <>
      <HeroSection />           {/* renders immediately */}
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarSection />     {/* streams in when ready */}
      </Suspense>
    </>
  );
}
```

Each `<Suspense>` boundary should have a meaningful skeleton — not a spinner for the whole page.

## Server Actions

Server actions run on the server. They should be:

**Typed end-to-end** — define input and return types with Zod:
```ts
'use server';

const schema = z.object({
  name: z.string().min(2),
  contact: z.string().min(1),
});

type ActionState = {
  success: boolean;
  error?: string;
};

export async function submitForm(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const result = schema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }
  // ... write to DB / external API
  return { success: true };
}
```

**Never trust the client** — always validate with Zod even if the form has client-side validation. The server action is a public endpoint.

**Return structured errors** — return `{ success: false, error: string }` rather than throwing. Only throw for truly unexpected errors (programming bugs, not user input).

**Side effects are non-blocking** — notifications (Telegram, email) should be fire-and-forget with `.catch()` logged. Never `await` a side effect that the user doesn't need to wait for.

**No sensitive data in return values** — do not return database rows, internal IDs, or stack traces to the client.

## File and Folder Conventions

```
app/
  [locale]/
    page.tsx          ← Server Component, async, fetches data
    layout.tsx        ← Server Component, wraps children
  actions/
    bookTour.ts       ← 'use server', one action per file
components/
  TourCard.tsx        ← Server Component if no interactivity
  BookingForm.tsx     ← 'use client' (form state, useActionState)
```

- `page.tsx` and `layout.tsx` are always Server Components
- Actions always in `app/actions/`, never colocated in component files
- One action per file, named export matching the file name

## What to Avoid

- `useEffect` for data fetching — use Server Components or `cache()`
- `"use client"` at the top of a page or layout
- `any` in action return types
- Unvalidated `formData.get()` values used directly
- `console.log` with user data in production actions
