/**
 * Get current date.
 * @return {string} current date formar dd/mm/yyyy.
 */
export function getDateFormatted(): string {
  const rawDate = new Date();
  const year = `${rawDate.getFullYear()}`;
  let month = "";
  let day = "";

  if ( (rawDate.getMonth() + 1) < 10 ) {
    month = "0" + (rawDate.getMonth() + 1);
  }

  if ( rawDate.getDate() < 10 ) {
    day = "0" + rawDate.getDate();
  } else {
    day = `${rawDate.getDate()}`;
  }

  return `${year}-${(month)}-${day}`;
}
