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
} from "../../../util/sheets_util";
import {
  getDriveInstance,
  uploadFile,
  deleteFile,
} from "../../../util/drive_util";

export const sheetName = "main";

/**
 * Update invoice purchase.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {any} payload payload value.
 */
export async function append(
  spreadsheetId: string,
  payload: any,
): Promise<any> {
  const sheets = getSheetInstance();
  const driveService = getDriveInstance();

  let id = 0;
  const date = getDateFormatted();
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

  const photoFoldersResponse = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    sheetName + "!C1:D1", 
  );

  validateSheetResponse(photoFoldersResponse);

  const invoiceFolderId = photoFoldersResponse.data.values[0][1];

  const invoicePhotoFileExtension = payload.photoInvoice.mimeType.split('/')[1];
  const filenameInvoicePhoto = id + "-factura." + invoicePhotoFileExtension;

  const photoInvoiceResponse = await uploadFile(
    driveService,
    invoiceFolderId,
    filenameInvoicePhoto,
    payload.photoInvoice.mimeType,
    payload.photoInvoice.rawData,
  );

  rows.push([
    id,
    date,
    payload.invoiceDate,
    payload.observations,
    payload.typeInvoice,
    payload.provider,
    payload.paymentType,
    payload.invoiceNumber,
    payload.activityMaterial,
    payload.price,
    payload.quantity,
    payload.chapter,
    photoInvoiceResponse.id,
    payload.withholdingTax,
    payload.iva,
    "",
  ]);

  validateSheetResponse(
    await sheetsAppend(
      sheets,
      googleAuth,
      spreadsheetId,
      sheetName + "!A3:P",
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
 * Update invoice purchase.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {any} payload payload value.
 */
export async function update(
  spreadsheetId: string,
  payload: any,
): Promise<any> {
  const invoice = payload.invoice;
  const sheets = getSheetInstance();
  const driveService = getDriveInstance();

  const date = getDateFormatted();
  const rows: any[][] = [];

  await deleteFile(
    driveService,
    invoice.photoInvoice.fileId,
  );

  const photoFoldersResponse = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    sheetName + "!C1:D1", 
  );

  validateSheetResponse(photoFoldersResponse);

  const invoiceFolderId = photoFoldersResponse.data.values[0][1];

  const invoicePhotoFileExtension = invoice.photoInvoice.mimeType.split('/')[1];
  const filenameInvoicePhoto = invoice.id + "-factura." + invoicePhotoFileExtension;

  const photoInvoiceResponse = await uploadFile(
    driveService,
    invoiceFolderId,
    filenameInvoicePhoto,
    invoice.photoInvoice.mimeType,
    invoice.photoInvoice.rawData,
  );

  rows.push([
    invoice.id,
    date,
    invoice.invoiceDate,
    invoice.observations,
    invoice.typeInvoice,
    invoice.provider,
    invoice.paymentType,
    invoice.invoiceNumber,
    invoice.activityMaterial,
    invoice.price,
    invoice.quantity,
    invoice.chapter,
    photoInvoiceResponse.id,
    invoice.withholdingTax,
    invoice.iva,
    invoice.photoAccountingSupport.fileId,
  ]);

  validateSheetResponse(
    await sheetUpdateRows(
      sheets,
      googleAuth,
      spreadsheetId,
      sheetName + "!A" + payload.position + ":P",
      rows,
    )
  );

  const response = {
    data: {
      id: invoice.id,
    },
  };

  return response;
}