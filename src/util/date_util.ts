/**
 * Get current date.
 * @return {string} current date formar yyyy-mm-dd.
 */
export function getDateFormatted(): string {
  const rawDate = new Date(
    new Date().toLocaleString(
      "en-US",
      {timeZone: "America/Bogota"},
    )
  );
  const year = `${rawDate.getFullYear()}`;
  let month = "";
  let day = "";

  if ( (rawDate.getMonth() + 1) < 10 ) {
    month = "0" + (rawDate.getMonth() + 1);
  } else {
    month = `${(rawDate.getMonth() + 1)}`;
  }

  if ( rawDate.getDate() < 10 ) {
    day = "0" + rawDate.getDate();
  } else {
    day = `${rawDate.getDate()}`;
  }

  return `${year}-${(month)}-${day}`;
}
