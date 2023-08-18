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
  DRIVE_URL_FILE_PATH,
  getDriveInstance,
  uploadFile,
  deleteFile,
  updateFilename,
} from "../../../util/drive_util";

export const sheetName = "main";

/**
 * Parse data.
 * @param {any} startPosition start position of sheet value.
 * @param {any} endPosition end position of sheet value.
 * @param {any} values values of sheet value.
 * @return {any} data parsed.
 */
function parseData(
  startPosition: number,
  endPosition: number,
  values: [any]
): any {
  const items: any[] = [];

  values.map((item: any, index: number) => {
    items.push({
      activityMaterial: item[11],
      price: item[12],
      quantity: item[13],
      chapter: item[14],
    });
  });

  let accountingSupport = "";

  if (values[0][15] != undefined){
    accountingSupport = values[0][15];
  }

  const data = {
    startPosition: startPosition,
    endPosition: endPosition,
    id: values[0][0],
    date: values[0][1],
    invoiceDate: values[0][2],
    observations: values[0][3],
    typeInvoice: values[0][4],
    provider: values[0][5],
    paymentType: values[0][6],
    invoiceNumber: values[0][7],
    photoInvoice: {
      fileId: values[0][8],
    },
    withholdingTax: values[0][9],
    iva: values[0][10],
    accountingSupport: accountingSupport,
    items: items,
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
    sheetName + "!A3:H",
  );

  validateSheetResponse(sheetResponse);

  const response = {
    data: sheetResponse.data,
  };

  return response;
}

/**
 * Get by range.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {string} start position of sheet.
 * @param {string} end position of sheet.
 */
export async function getByRange(
  spreadsheetId: string,
  start: string,
  end: string,
): Promise<any> {
  const sheets = getSheetInstance();
  const range = sheetName + "!A" + start + ":P" + end;
  const sheetResponse = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    range,
  );

  validateSheetResponse(sheetResponse);

  const data = parseData(
    parseInt(start),
    parseInt(end),
    sheetResponse.data.values,
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
  const invoicePhotoFileExtension = payload.photoInvoice.mimeType.split("/")[1];

  const filename = [];
  filename.push(
    id,
    "-",
    payload.provider,
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
    payload.photoInvoice.mimeType,
    payload.photoInvoice.rawData,
  );

  const photoURL = DRIVE_URL_FILE_PATH + photoInvoiceResponse.id;

  payload.items.forEach((item: any) => {
    rows.push([
      id,
      date,
      payload.invoiceDate,
      payload.observations,
      payload.typeInvoice,
      payload.provider,
      payload.paymentType,
      payload.invoiceNumber,
      photoURL,
      payload.withholdingTax,
      payload.iva,
      item.activityMaterial,
      item.price,
      item.quantity,
      item.chapter,
      "",
    ]);
  });

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
 * Append order purchase.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {string} startPosition startPosition of sheet.
 * @param {string} endPosition endPosition of sheet.
 */
export async function deleteInvoice(
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

  // Delete rows
  deleteInvoice(
    spreadsheetId,
    payload.startPosition,
    payload.endPosition,
  );

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

  let fileId = "";
  const photoFoldersResponse = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    sheetName + "!C1:D1",
  );

  validateSheetResponse(photoFoldersResponse);

  const fileIdPayload = payload.photoInvoice.fileId;
  const photoUrlSplitted = fileIdPayload.split(DRIVE_URL_FILE_PATH);
  const fileIdSplitted = photoUrlSplitted[1];

  if (
    payload.photoInvoice.mimeType != undefined &&
    payload.photoInvoice.rawData != undefined
  ) {
    // Delete image
    await deleteFile(
      driveService,
      fileIdSplitted,
    );

    const invoiceFolderId = photoFoldersResponse.data.values[0][1];
    const mimeTypeFile = payload.photoInvoice.mimeType;
    const invoicePhotoFileExtension = mimeTypeFile.split("/")[1];

    const filename = [];
    filename.push(
      id,
      "-",
      payload.provider,
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
      payload.photoInvoice.mimeType,
      payload.photoInvoice.rawData,
    );

    fileId = photoInvoiceResponse.id;
  } else {
    const filename = [];
    filename.push(
      id,
      "-",
      payload.provider,
      "-",
      "factura"
    );
    const filenameInvoicePhoto = filename.join("");
    await updateFilename(
      driveService,
      fileIdSplitted,
      filenameInvoicePhoto,
    );
    fileId = fileIdSplitted;
  }

  const photoURL = DRIVE_URL_FILE_PATH + fileId;

  payload.items.forEach((item: any) => {
    rows.push([
      id,
      date,
      payload.invoiceDate,
      payload.observations,
      payload.typeInvoice,
      payload.provider,
      payload.paymentType,
      payload.invoiceNumber,
      photoURL,
      payload.withholdingTax,
      payload.iva,
      item.activityMaterial,
      item.price,
      item.quantity,
      item.chapter,
      payload.accountingSupport,
    ]);
  });

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
 * Add accounting support to the invoice purchase.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {any} payload payload value.
 */
export async function addAccountingSupport(
  spreadsheetId: string,
  payload: any,
): Promise<any> {
  const sheets = getSheetInstance();
  const rows: any[][] = [];

  rows.push([
    payload.accountingSupport,
  ]);

  validateSheetResponse(
    await sheetUpdateRows(
      sheets,
      googleAuth,
      spreadsheetId,
      sheetName + "!P" + payload.startPosition + ":P" + payload.endPosition,
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
