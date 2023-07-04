/**
 * Get current date.
 * @return {string} current date formar dd/mm/yyyy.
 */
export function getDateFormatted(): string {
  const rawDate = new Date();
  const day = rawDate.getDate();
  const month = (rawDate.getMonth() + 1);
  const year = rawDate.getFullYear();
  return `${day}/${(month)}/${year}`;
}
