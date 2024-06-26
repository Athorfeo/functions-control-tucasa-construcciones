import {google} from "googleapis";
import {googleAuth} from "../util/google_auth";

export const CONTROL_SHEETS = {
  data: {
    spreadsheetId: "1VuxV5doIkDNis3THLZ5ObF6mRjshIb-CdsHf-65C9fw",
  },
};

/**
 * Validate sheet response
 * @param {any} response sheet response.
 */
export function validateSheetResponse(response: any) {
  if (response.status < 200 && response.status >= 300) {
    throw Error("Google service status error: " + response.status);
  }
}

/**
 * Get a Google Sheet instance.
 * @return {GoogleAuth<JSONClient>} GoogleAuth instance.
 */
export function getSheetInstance() {
  return google.sheets({
    version: "v4",
    auth: googleAuth,
  });
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
  const response = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range,
  });

  return parseInt(response.data.values[0][0]);
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
): Promise<any> {
  return sheets.spreadsheets.values.update({
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
): Promise<any> {
  return sheets.spreadsheets.values.update({
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
 * Delete rows from a Sheet.
 * @param {any} sheets sheet instance.
 * @param {any} auth auth instance.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {any} sheetId sheetId value.
 * @param {any} startPosition start position of sheet range.
 * @param {any} endPosition end position of sheet range.
 */
export async function deleteRowsSheet(
  sheets: any,
  auth: any,
  spreadsheetId: string,
  sheetId: number,
  startPosition: number,
  endPosition: number,
): Promise<any> {
  return sheets.spreadsheets.batchUpdate({
    auth,
    spreadsheetId,
    resource: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheetId,
            dimension: "ROWS",
            startIndex: startPosition - 1,
            endIndex: endPosition,
          },
        },
      }],
    },
  });
}

/**
 * Get start position from sheet range.
 * @param {any} range range of sheet value.
 * @return {number} Range start position of sheet value.
 */
export function getRangeStartPosition(
  range: string
): number {
  const rangeSplited = range.split(":");
  return parseInt(
    rangeSplited[0]
      .split("!")[1]
      .split(/[^\d]+/).join("")
  );
}
