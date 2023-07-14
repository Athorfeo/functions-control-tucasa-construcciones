import {googleAuth} from "../../../util/google_auth";
import {getDateFormatted} from "../../../util/date_util";
import {
  validateSheetResponse,
  getSheetInstance,
  getRawLastId,
  updateLastId,
  sheetsGet,
  sheetsAppend,
  deleteRowsSheet,
  sheetUpdateRows,
} from "../../../util/sheets_util";

export const sheetName = "main";

/**
 * Get all order purchase.
 * @param {any} spreadsheetId spreadsheetId value.
 */
export async function getAll(
  spreadsheetId: string,
): Promise<any> {
  const sheets = getSheetInstance();
  const sheetResponse = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    sheetName + "!A3:L",
  );

  validateSheetResponse(sheetResponse);

  const response = {
    data: sheetResponse.data,
  };

  return response;
}

/**
 * Get all order purchase.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {string} startPosition startPosition of sheet.
 * @param {string} endPosition endPosition of sheet.
 */
export async function getByRange(
  spreadsheetId: string,
  startPosition: string,
  endPosition: string,
): Promise<any> {
  const sheets = getSheetInstance();
  const range = sheetName + "!A" + startPosition + ":L" + endPosition;
  const sheetResponse = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    range,
  );

  validateSheetResponse(sheetResponse);

  const response = {
    data: sheetResponse.data,
  };

  return response;
}

/**
 * Append order purchase.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {any} payload payload value.
 */
export async function append(
  spreadsheetId: string,
  payload: any,
): Promise<any> {
  const sheets = getSheetInstance();
  let id = 0;

  const rawLastId = await getRawLastId(
    sheets,
    googleAuth,
    spreadsheetId,
    sheetName + "!B1",
  );

  if (rawLastId >= 0) {
    id = rawLastId + 1;
  }

  const date = getDateFormatted();
  const rows: any[][] = [];

  payload.activities.forEach((product: any) => {
    rows.push([
      id,
      date,
      payload.observations,
      payload.startDate,
      payload.endDate,
      product.activity,
      product.unit,
      product.chapterName,
      product.photo,
      0,
      "",
      0
    ]);
  });

  validateSheetResponse(
    await sheetsAppend(
      sheets,
      googleAuth,
      spreadsheetId,
      sheetName + "!A3:L",
      rows,
    )
  );

  validateSheetResponse(
    await updateLastId(
      sheets,
      googleAuth,
      spreadsheetId,
      sheetName + "!B1",
      id,
    )
  );

  const response = {
    data: {
      id: id,
    },
  };

  return response;
}

/**
 * Append order purchase.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {string} startPosition startPosition of sheet.
 * @param {string} endPosition endPosition of sheet.
 */
export async function deleteItem(
  spreadsheetId: string,
  startPosition: number,
  endPosition: number,
): Promise<any> {
  const sheets = getSheetInstance();
  const sheetResponse = await deleteRowsSheet(
    sheets,
    googleAuth,
    spreadsheetId,
    0,
    startPosition,
    endPosition,
  );

  validateSheetResponse(sheetResponse);
}

/**
 * Approve order purchase.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {any} payload payload value.
 */
export async function approve(
  spreadsheetId: string,
  payload: any,
): Promise<any> {
  const sheets = getSheetInstance();

  const startPosition = payload.startPosition;
  const endPosition = payload.endPosition;
  const rowAffected = (endPosition - startPosition);
  const rows: any[][] = [];

  for (let i = 0; i <= rowAffected; i++) {
    rows.push([
      1,
      payload.email,
      payload.activities[i].executedQuantity,
    ]);
  }

  const range = sheetName + "!J" + startPosition + ":L" + endPosition;
  const sheetResponse = await sheetUpdateRows(
    sheets,
    googleAuth,
    spreadsheetId,
    range,
    rows
  );

  validateSheetResponse(sheetResponse);

  const response = {
    code: 0,
  };

  return response;
}
