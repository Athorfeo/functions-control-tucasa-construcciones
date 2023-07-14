/**
 * Get current date.
 * @return {string} current date formar dd/mm/yyyy.
 */
export function getDateFormatted(): string {
  const rawDate = new Date();
  const year: String = `${rawDate.getFullYear()}`;
  let month: String = "";
  let day: String = "";

  if( (rawDate.getMonth() + 1) < 10 ) {
    month = "0" + (rawDate.getMonth() + 1);
  }

  if( rawDate.getDate() < 10 ) {
    day = "0" + rawDate.getDate();
  }

  return `${year}-${(month)}-${day}`;
}
