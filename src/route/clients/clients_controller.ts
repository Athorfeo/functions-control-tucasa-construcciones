import {getDateFormatted} from "../../util/date_util";
import {googleAuth} from "../../util/google_auth";
import {
  validateSheetResponse,
  getSheetInstance,
  getRawLastId,
  sheetsGet,
  sheetsAppend,
  sheetUpdateRows,
  updateLastId,
  getRangeStartPosition,
} from "../../util/sheets_util";
import {
  uploadRutFile,
  updateRutFile,
  uploadDocumentFile,
  updateDocumentFile,
} from "./clients_file_controller";
import {
  parseClientRow,
  parseHouseholdsRow,
  parsePaymentsRow,
} from "./clients_data_controller";

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
    sheetName + "!A3:H",
  );

  validateSheetResponse(sheetResponse);

  const rows: any[][] = [];

  if (sheetResponse.data.values != undefined) {
    const rangeStartPosition = getRangeStartPosition(sheetResponse.data.range);
    sheetResponse.data.values.forEach((item: any, index: number) => {
      rows.push(parseClientRow(rangeStartPosition + index, item));
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
  const range = sheetName + "!A" + position + ":H" + position;
  const sheetResponse = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    range,
  );

  validateSheetResponse(sheetResponse);

  const data = parseClientRow(
    parseInt(position),
    sheetResponse.data.values[0],
  );

  // Get households
  const rangeHouseholds = "viviendas!A3:J";
  const sheetResponseHouseholds = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    rangeHouseholds,
  );

  const rowsHouseholds: any[][] = [];

  if (sheetResponseHouseholds.data.values != undefined) {
    const rangeResponseHouseholds = sheetResponse.data.range;
    const startPositionHouseholds = getRangeStartPosition(
      rangeResponseHouseholds
    );

    sheetResponseHouseholds.data.values.forEach((item: any, index: number) => {
      if (data.document === item[2]) {
        rowsHouseholds.push(parseHouseholdsRow(
          startPositionHouseholds + index,
          item
        ));
      }
    });
  }

  data.households = rowsHouseholds;

  // Get payments
  const rangePayments = "pagos!A3:J";
  const sheetResponsePayments = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    rangePayments,
  );

  const rangeResponsePayments = sheetResponse.data.range;
  const startPositionPayments = getRangeStartPosition(rangeResponsePayments);

  const rowsPayments: any[][] = [];

  sheetResponsePayments.data.values.forEach((item: any, index: number) => {
    if (data.document === item[3]) {
      rowsPayments.push(parsePaymentsRow(
        startPositionPayments + index,
        item
      ));
    }
  });

  data.payments = rowsPayments;

  console.log(`Data: ${JSON.stringify(data)}`);

  const response = {
    data: data,
  };

  return response;
}

/**
 * Append invoice purchase.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {any} payload payload value.
 */
export async function append(
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
    sheetName + "!C1:F1",
  );

  validateSheetResponse(foldersIdResponse);

  const rutFolderId = foldersIdResponse.data.values[0][1];
  const documentFolderId = foldersIdResponse.data.values[0][3];

  const rutFileUrl = await uploadRutFile(
    payload.document,
    rutFolderId,
    payload.rutFile.mimeType,
    payload.rutFile.rawData,
  );

  const documentFileUrl = await uploadDocumentFile(
    payload.document,
    documentFolderId,
    payload.documentFile.mimeType,
    payload.documentFile.rawData,
  );

  rows.push([
    id,
    createdDate,
    payload.document,
    payload.name,
    payload.address,
    payload.email,
    rutFileUrl,
    documentFileUrl,
  ]);

  validateSheetResponse(
    await sheetsAppend(
      sheets,
      googleAuth,
      spreadsheetId,
      sheetName + "!A3:H",
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
 * Update client.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {any} payload payload value.
 */
export async function update(
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
    sheetName + "!C1:F1",
  );

  validateSheetResponse(foldersIdResponse);

  // Update rut file
  const rutFileUrl = await updateRutFile(
    payload,
    foldersIdResponse.data.values[0][1]
  );

  // Update document file
  const documentFileUrl = await updateDocumentFile(
    payload,
    foldersIdResponse.data.values[0][3]
  );

  rows.push([
    payload.id,
    createdDate,
    payload.document,
    payload.name,
    payload.address,
    payload.email,
    rutFileUrl,
    documentFileUrl,
  ]);

  validateSheetResponse(
    await sheetUpdateRows(
      sheets,
      googleAuth,
      spreadsheetId,
      sheetName + "!A" + payload.position + ":H" + payload.position,
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
