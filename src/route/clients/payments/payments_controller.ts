import {getDateFormatted} from "../../../util/date_util";
import {googleAuth} from "../../../util/google_auth";
import {
  validateSheetResponse,
  getSheetInstance,
  getRawLastId,
  sheetsGet,
  sheetsAppend,
  sheetUpdateRows,
  updateLastId,
  deleteRowsSheet,
} from "../../../util/sheets_util";
import {
  uploadPaymentFile,
  updatePaymentFile,
  deletePaymentFile,
} from "./payments_file_controller";

export const sheetName = "pagos";

/**
 * Append payment.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {any} payload payload value.
 */
export async function appendPayment(
  spreadsheetId: string,
  payload: any,
): Promise<any> {
  const sheets = getSheetInstance();

  let id = 0;
  const createdDate = getDateFormatted();
  const rows: any[][] = [];

  const rawLastId = await getRawLastId(
    sheets,
    googleAuth,
    spreadsheetId,
    sheetName + "!B1",
  );

  if (rawLastId >= 0) {
    id = rawLastId + 1;
  }

  const foldersIdResponse = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    sheetName + "!C1:D1",
  );

  validateSheetResponse(foldersIdResponse);

  const paymentFolderId = foldersIdResponse.data.values[0][1];

  let paymentFileUrl = "";
  if (payload.paymentFile.rawData !== undefined) {
    paymentFileUrl = await uploadPaymentFile(
      payload,
      paymentFolderId
    );
  }

  rows.push([
    id,
    createdDate,
    payload.paymentDate,
    payload.document,
    payload.amount,
    payload.paymentType,
    payload.bank,
    payload.observations,
    paymentFileUrl,
    "",
  ]);

  validateSheetResponse(
    await sheetsAppend(
      sheets,
      googleAuth,
      spreadsheetId,
      sheetName + "!A3:J",
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
 * Update payment.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {any} payload payload value.
 */
export async function updatePayment(
  spreadsheetId: string,
  payload: any,
): Promise<any> {
  const sheets = getSheetInstance();
  const createdDate = getDateFormatted();
  const rows: any[][] = [];

  const foldersIdResponse = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    sheetName + "!C1:H1",
  );

  validateSheetResponse(foldersIdResponse);

  // Update payment file
  const paymentFolderId = foldersIdResponse.data.values[0][1];
  const paymentFileUrl = await updatePaymentFile(
    payload,
    paymentFolderId
  );

  rows.push([
    payload.id,
    createdDate,
    payload.paymentDate,
    payload.document,
    payload.amount,
    payload.paymentType,
    payload.bank,
    payload.observations,
    paymentFileUrl,
    payload.accountingSupport,
  ]);

  validateSheetResponse(
    await sheetUpdateRows(
      sheets,
      googleAuth,
      spreadsheetId,
      sheetName + "!A" + payload.position + ":J" + payload.position,
      rows,
    )
  );
  const response = {
    data: {
      id: payload.id,
    },
  };

  return response;
}

/**
 * Delete payment.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {any} payload payload value.
 */
export async function deletePayment(
  spreadsheetId: string,
  payload: any
): Promise<any> {
  const sheets = getSheetInstance();

  await deletePaymentFile(payload);

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheetId,
    ranges: [sheetName],
    includeGridData: false,
    auth: googleAuth,
  });

  const sheetId = spreadsheet.data.sheets?.find((item) => {
    item.properties?.title === sheetName;
  })?.properties?.sheetId ?? -1;

  const position = Number(payload.position);

  const sheetResponse = await deleteRowsSheet(
    sheets,
    googleAuth,
    spreadsheetId,
    sheetId,
    position,
    position,
  );

  validateSheetResponse(sheetResponse);

  const response = {
    data: {
      id: payload.id,
    },
  };

  return response;
}

