import {getDateFormatted} from "../../../util/date_util";
import {googleAuth} from "../../../util/google_auth";
import {
  validateSheetResponse,
  getSheetInstance,
  getRawLastId,
  sheetsGet,
  sheetsAppend,
  sheetUpdateRows,
  updateLastId
} from "../../../util/sheets_util";
import {
  uploadPromiseFile,
  updatePromiseFile,
} from "./households_promise_file_controller";
import {
  uploadInvoiceFile,
  updateInvoiceFile,
} from "./households_invoice_file_controller";
import {
  uploadCertificateFile,
  updateCertificateFile,
} from "./households_certificate_file_controller";

export const sheetName = "viviendas";

/**
 * Append household.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {any} payload payload value.
 */
export async function appendHousehold(
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
    sheetName + "!C1:H1",
  );

  validateSheetResponse(foldersIdResponse);

  const promiseFolderId = foldersIdResponse.data.values[0][1];
  const invoiceFolderId = foldersIdResponse.data.values[0][3];
  const certificateFolderId = foldersIdResponse.data.values[0][5];

  const promiseFileUrl = await uploadPromiseFile(
    payload,
    promiseFolderId
  );

  const invoiceFileUrl = await uploadInvoiceFile(
    payload,
    invoiceFolderId
  );

  const certificateFileUrl = await uploadCertificateFile(
    payload,
    certificateFolderId
  );

  rows.push([
    id,
    createdDate,
    payload.document,
    payload.numberHousehold,
    payload.value,
    payload.initialFee,
    payload.balance,
    promiseFileUrl,
    invoiceFileUrl,
    certificateFileUrl,
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
 * Update household.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {any} payload payload value.
 */
export async function updateHousehold(
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
  
  // Update promise file
  const promiseFolderId = foldersIdResponse.data.values[0][1];
  let promiseFileUrl = await updatePromiseFile(
    payload,
    promiseFolderId
  );

  // Update invoice file
  const invoiceFolderId = foldersIdResponse.data.values[0][3];
  let invoiceFileUrl = await updateInvoiceFile(
    payload,
    invoiceFolderId
  );
  
  // Update certificate file
  const certificateFolderId = foldersIdResponse.data.values[0][5];
  let certificateFileUrl = await updateCertificateFile(
    payload,
    certificateFolderId
  );

  rows.push([
    payload.id,
    createdDate,
    payload.document,
    payload.numberHousehold,
    payload.value,
    payload.initialFee,
    payload.balance,
    promiseFileUrl,
    invoiceFileUrl,
    certificateFileUrl,
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
