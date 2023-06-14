import {google} from "googleapis";
import {googleAuth} from "../util/google_auth";

export const CONTROL_SHEETS = {
  data: {
    spreadsheetId: "1VuxV5doIkDNis3THLZ5ObF6mRjshIb-CdsHf-65C9fw",
  },
};

/**
 * Get a Google Sheet instance.
 * @return {GoogleAuth<JSONClient>} GoogleAuth instance.
 */
export function getSheetInstance() {
  return google.sheets({version: "v4", auth: googleAuth});
}

/**
 * Get a sheet data.
 * @param {any} sheets sheet instance.
 * @param {any} auth auth instance.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {any} range range of sheet.
 * @return {Promise<any>} Sheet instance.
 */
export async function sheetsGet(
  sheets: any,
  auth: any,
  spreadsheetId: string,
  range: string
): Promise<any> {
  return sheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range,
  });
}

/**
 * Get last id from a Sheet.
 * @param {any} sheets sheet instance.
 * @param {any} auth auth instance.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {any} range range of sheet.
 * @return {Promise<number>} last id value.
 */
export async function getRawLastId(
  sheets: any,
  auth: any,
  spreadsheetId: string,
  range: string
): Promise<number> {
  let lastId = -1;

  try {
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range,
    });

    if (response.data.values != null) {
      lastId = parseInt(response.data.values[0][0]);
      console.log(`rawLastId: ${lastId}`);
    }
  } catch (error) {
    console.log(error);
  }

  return lastId;
}

/**
 * Update last id from a Sheet.
 * @param {any} sheets sheet instance.
 * @param {any} auth auth instance.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {any} range range of sheet.
 * @param {any} lastId lastId of sheet.
 */
export async function updateLastId(
  sheets: any,
  auth: any,
  spreadsheetId: string,
  range: string,
  lastId: number,
) {
  sheets.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [lastId],
      ],
    },
  });
}

/**
 * Append a new row.
 * @param {any} sheets sheet instance.
 * @param {any} auth auth instance.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {string} range range of sheet.
 * @param {any} rows rows to append.
 * @return {Promise<any>} result of execution.
 */
export async function sheetsAppend(
  sheets: any,
  auth: any,
  spreadsheetId: string,
  range: string,
  rows: any,
): Promise<any> {
  return sheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: rows,
    },
  });
}

/**
 * Update rows from a Sheet.
 * @param {any} sheets sheet instance.
 * @param {any} auth auth instance.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {any} range range of sheet.
 * @param {any} rows lastId of sheet.
 */
export async function sheetUpdateRows(
  sheets: any,
  auth: any,
  spreadsheetId: string,
  range: string,
  rows: any
) {
  sheets.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: rows,
    },
  });
}
