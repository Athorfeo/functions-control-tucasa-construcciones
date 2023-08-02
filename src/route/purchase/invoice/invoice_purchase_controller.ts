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
 * Parse data.
 * @param {any} startPosition start position of sheet value.
 * @param {any} values start position of sheet value.
 */
function parseData(
  startPosition: number,
  //endPosition: number,
  values: [any]
): any[] {
  const data = values.map((item: any, index: number) => {
    return {
      position: (startPosition + index),
      invoice: {
        id: item[0],
        date: item[1],
        invoiceDate: item[2],
        observations: item[3],
        typeInvoice: item[4],
        provider: item[5],
        paymentType: item[6],
        invoiceNumber: item[7],
        activityMaterial: item[8],
        price: item[9],
        quantity: item[10],
        chapter: item[11],
        photoInvoice: {
          fileId: item[12],
        },
        withholdingTax: item[13],
        iva: item[14],
        photoAccountingSupport: {
          fileId: item[15],
        }
      }
    };
  });

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
    sheetName + "!A3:P",
  );

  validateSheetResponse(sheetResponse);

  const rangeSplited = sheetResponse.data.range.split(':');
  const rangeStartPosition = parseInt(rangeSplited[0].split('!')[1].split(/[^\d]+/).join(""));
  //const rangeEndPosition = rangeSplited[1].split(/[^\d]+/).join("");

  const data = parseData(
    rangeStartPosition, 
    sheetResponse.data.values
  );

  const response = {
    data: data,
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
  const range = sheetName + "!A" + position + ":P" + position;
  const sheetResponse = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    range,
  );

  validateSheetResponse(sheetResponse);

  const data = parseData(
    parseInt(position), 
    sheetResponse.data.values
  );

  const response = {
    data: data[0],
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

  if(invoice.photoAccountingSupport.fileId !== "") {
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

  const fileExtension = invoice.photoAccountingSupport.mimeType.split('/')[1];
  const filenamePhoto = invoice.id + "-factura-soporte-contable." + fileExtension;

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