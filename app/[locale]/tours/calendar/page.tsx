import { redirect } from 'next/navigation';

/**
 * The calendar is hidden for now (compact layout), so this page sends visitors
 * and old links to the homepage instead of showing it. `CalendarSection` is kept;
 * the page's previous content is in git history. A temporary redirect on purpose,
 * since the page may come back.
 */
export default async function CalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/`);
}
