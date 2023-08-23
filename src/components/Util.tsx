import { format, parseISO } from 'date-fns';

export function formatDateRange(startDate: string, endDate: string): string {
  const parsedStartDate = parseISO(startDate);
  const parsedEndDate = parseISO(endDate);

  const formattedStartDate = format(parsedStartDate, 'dd-MM-yyyy');
  const formattedEndDate = format(parsedEndDate, 'dd-MM-yyyy');

  return `${formattedStartDate} ~ ${formattedEndDate}`;
}

export function formatDate(date: string): string {
  const parsedDate = parseISO(date);
  const formattedDate = format(parsedDate, 'dd-MM-yyyy');

  return formattedDate;
}

export function formatTaskCount(n: number): string {
  if (n === 1) { return "1 task" }
  else { return `${n} tasks` }
}
