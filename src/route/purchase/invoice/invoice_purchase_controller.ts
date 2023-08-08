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

  let photoAccountingSupportFileId = "";
  if (values[0][15] != undefined) {
    photoAccountingSupportFileId = values[0][15];
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
    photoAccountingSupport: {
      fileId: photoAccountingSupportFileId,
    },
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
  const filenameInvoicePhoto = id + "-factura." + invoicePhotoFileExtension;

  const photoInvoiceResponse = await uploadFile(
    driveService,
    invoiceFolderId,
    filenameInvoicePhoto,
    payload.photoInvoice.mimeType,
    payload.photoInvoice.rawData,
  );

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
      photoInvoiceResponse.id,
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

  if (
    payload.photoInvoice.mimeType != undefined &&
    payload.photoInvoice.rawData != undefined
  ) {
    // Delete image
    await deleteFile(
      driveService,
      payload.photoInvoice.fileId,
    );

    const invoiceFolderId = photoFoldersResponse.data.values[0][1];
    const mimeTypeFile = payload.photoInvoice.mimeType;
    const invoicePhotoFileExtension = mimeTypeFile.split("/")[1];
    const filenameInvoicePhoto = id + "-factura." + invoicePhotoFileExtension;

    const photoInvoiceResponse = await uploadFile(
      driveService,
      invoiceFolderId,
      filenameInvoicePhoto,
      payload.photoInvoice.mimeType,
      payload.photoInvoice.rawData,
    );

    fileId = photoInvoiceResponse.id;
  } else {
    const filenameInvoicePhoto = id + "-factura";
    await updateFilename(
      driveService,
      payload.photoInvoice.fileId,
      filenameInvoicePhoto,
    );
    fileId = payload.photoInvoice.fileId;
  }

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
      fileId,
      payload.withholdingTax,
      payload.iva,
      item.activityMaterial,
      item.price,
      item.quantity,
      item.chapter,
      payload.photoAccountingSupport.fileId,
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
  const invoice = payload.invoice;
  const sheets = getSheetInstance();
  const driveService = getDriveInstance();

  const rows: any[][] = [];

  if (invoice.photoAccountingSupport.fileId !== "") {
    await deleteFile(
      driveService,
      invoice.photoAccountingSupport.fileId,
    );
  }

  const folderResponse = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    sheetName + "!E1:F1",
  );

  validateSheetResponse(folderResponse);

  const folderId = folderResponse.data.values[0][1];

  const fileExtension = invoice.photoAccountingSupport.mimeType.split("/")[1];
  const filenameHint = "-factura-soporte-contable.";
  const filenamePhoto = invoice.id + filenameHint + fileExtension;

  const photoResponse = await uploadFile(
    driveService,
    folderId,
    filenamePhoto,
    invoice.photoAccountingSupport.mimeType,
    invoice.photoAccountingSupport.rawData,
  );

  rows.push([
    photoResponse.id,
  ]);

  validateSheetResponse(
    await sheetUpdateRows(
      sheets,
      googleAuth,
      spreadsheetId,
      sheetName + "!P" + payload.position,
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
