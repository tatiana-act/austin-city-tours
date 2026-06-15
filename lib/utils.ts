const centralTimeParts = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Chicago',
  year: 'numeric', month: 'numeric', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  hour12: false,
});

export function parseCentralTime(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const utcProbe = Date.UTC(year, month - 1, day, hour, minute, 0);
  const parts = centralTimeParts.formatToParts(new Date(utcProbe));
  const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value ?? '0');
  const centralAsUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'));
  return new Date(utcProbe + (utcProbe - centralAsUtc));
}

export function formatDateToUserLocale(
  dateString: string,
  locale: string,
): string {
  // Validate the date string format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return dateString;
  }

  // Parse the date string
  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return dateString;
  }

  // Use user's locale if not provided, fallback to 'en-US'
  const userLocale = locale || Intl.DateTimeFormat().resolvedOptions().locale;

  // Format the date using Intl.DateTimeFormat
  const formatter = new Intl.DateTimeFormat(userLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  return formatter.format(date);
}
