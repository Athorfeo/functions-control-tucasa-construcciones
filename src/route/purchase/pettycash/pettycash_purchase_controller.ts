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
  getRangeStartPosition,
} from "../../../util/sheets_util";
import {
  DRIVE_URL_FILE_PATH,
  getDriveInstance,
  uploadFile,
  deleteFile,
  updateFilename,
} from "../../../util/drive_util";

export const sheetName = "main";

/**
 * Parse data.
 * @param {any} position position of sheet value.
 * @param {any} values values of sheet value.
 * @return {any} data parsed.
 */
function parseRow(
  position: number,
  values: any[]
): any {
  let fileUrl = "";
  let accountingDocument = "";

  if (values[5] != undefined) {
    fileUrl = values[5];
  }

  if (values[6] != undefined) {
    accountingDocument = values[6];
  }

  const data = {
    position: position,
    id: values[0],
    createdDate: values[1],
    date: values[2],
    bank: values[3],
    amount: values[4],
    fileUrl: fileUrl,
    accountingDocument: accountingDocument,
  };

  return data;
}

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
    sheetName + "!A3:G",
  );

  validateSheetResponse(sheetResponse);

  const rows: any[][] = [];

  if (sheetResponse.data.values != undefined) {
    const rangeStartPosition = getRangeStartPosition(sheetResponse.data.range);
    sheetResponse.data.values.forEach((item: any, index: number) => {
      rows.push(parseRow(rangeStartPosition + index, item));
    });
  }

  const response = {
    data: rows,
  };

  return response;
}

/**
 * Get by range.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {string} position position of sheet.
 */
export async function getByRange(
  spreadsheetId: string,
  position: string,
): Promise<any> {
  const sheets = getSheetInstance();
  const range = sheetName + "!A" + position + ":G" + position;
  const sheetResponse = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    range,
  );

  validateSheetResponse(sheetResponse);

  const data = parseRow(
    parseInt(position),
    sheetResponse.data.values[0],
  );

  const response = {
    data: data,
  };

  return response;
}


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

  const photoFoldersResponse = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    sheetName + "!C1:D1",
  );

  validateSheetResponse(photoFoldersResponse);

  const invoiceFolderId = photoFoldersResponse.data.values[0][1];
  const invoicePhotoFileExtension = payload.photo.mimeType.split("/")[1];

  const filename = [];
  filename.push(
    id,
    "-",
    payload.date,
    "-",
    "factura",
    ".",
    invoicePhotoFileExtension,
  );

  const filenameInvoicePhoto = filename.join("");

  const photoInvoiceResponse = await uploadFile(
    driveService,
    invoiceFolderId,
    filenameInvoicePhoto,
    payload.photo.mimeType,
    payload.photo.rawData,
  );

  const photoURL = DRIVE_URL_FILE_PATH + photoInvoiceResponse.id;

  rows.push([
    id,
    createdDate,
    payload.date,
    payload.bank,
    payload.amount,
    photoURL,
    "",
  ]);

  validateSheetResponse(
    await sheetsAppend(
      sheets,
      googleAuth,
      spreadsheetId,
      sheetName + "!A3:G",
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
  const sheets = getSheetInstance();
  const driveService = getDriveInstance();
  const createdDate = getDateFormatted();
  const rows: any[][] = [];
  let fileId = "";

  const photoFoldersResponse = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    sheetName + "!C1:D1",
  );

  validateSheetResponse(photoFoldersResponse);

  const fileUrl = payload.photo.fileUrl;
  const photoUrlSplitted = fileUrl.split(DRIVE_URL_FILE_PATH);
  fileId = photoUrlSplitted[1];

  if (
    payload.photo.mimeType != undefined &&
    payload.photo.rawData != undefined
  ) {
    // Delete image
    await deleteFile(
      driveService,
      fileId,
    );

    const invoiceFolderId = photoFoldersResponse.data.values[0][1];
    const mimeTypeFile = payload.photo.mimeType;
    const invoicePhotoFileExtension = mimeTypeFile.split("/")[1];

    const filename = [];
    filename.push(
      payload.id,
      "-",
      payload.date,
      "-",
      "factura",
      ".",
      invoicePhotoFileExtension,
    );

    const filenameInvoicePhoto = filename.join("");

    const photoInvoiceResponse = await uploadFile(
      driveService,
      invoiceFolderId,
      filenameInvoicePhoto,
      payload.photo.mimeType,
      payload.photo.rawData,
    );

    fileId = photoInvoiceResponse.id;
  } else {
    const filename = [];
    filename.push(
      payload.id,
      "-",
      payload.date,
      "-",
      "factura"
    );
    const filenameInvoicePhoto = filename.join("");
    await updateFilename(
      driveService,
      fileId,
      filenameInvoicePhoto,
    );
  }

  const photoURL = DRIVE_URL_FILE_PATH + fileId;

  rows.push([
    payload.id,
    createdDate,
    payload.date,
    payload.bank,
    payload.amount,
    photoURL,
    payload.accountingDocument,
  ]);

  validateSheetResponse(
    await sheetUpdateRows(
      sheets,
      googleAuth,
      spreadsheetId,
      sheetName + "!A" + payload.position + ":G" + payload.position,
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
 * Add accounting support to the invoice purchase.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {any} payload payload value.
 */
export async function updateAccountingDocument(
  spreadsheetId: string,
  payload: any,
): Promise<any> {
  const sheets = getSheetInstance();
  const rows: any[][] = [];

  rows.push([
    payload.accountingDocument,
  ]);

  validateSheetResponse(
    await sheetUpdateRows(
      sheets,
      googleAuth,
      spreadsheetId,
      sheetName + "!G" + payload.position + ":G" + payload.position,
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
