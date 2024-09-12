import {googleAuth} from "../../../util/google_auth";
import {
  CONTROL_SHEETS,
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
  uploadRutFile,
  updateRutFile
} from "./suppliers_file_controller";
import {
  parseSupplierRow,
} from "./suppliers_data_controller";

export const sheetName = "suppliers";
const spreadsheetId = CONTROL_SHEETS.data.spreadsheetId;

/**
 * Get all Suppliers.
 */
export async function getAll(): Promise<any> {
  const sheets = getSheetInstance();
  const sheetResponse = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    sheetName + "!A3:K",
  );

  validateSheetResponse(sheetResponse);

  const rows: any[][] = [];
  if (sheetResponse.data.values != undefined) {
    const rangeStartPosition = getRangeStartPosition(sheetResponse.data.range);
    sheetResponse.data.values.forEach((item: any, index: number) => {
      rows.push(parseSupplierRow(rangeStartPosition + index, item));
    });
  }

  const response = {
    data: rows,
  };

  return response;
}

/**
 * Get by range | Suppliers.
 * @param {string} position position of sheet.
 */
export async function getByRange(
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

  const data = parseSupplierRow(
    parseInt(position),
    sheetResponse.data.values[0],
  );

  const response = {
    data: data,
  };

  return response;
}

/**
 * Append Supplier.
 * @param {any} payload payload value.
 */
export async function append(
  payload: any,
): Promise<any> {
  const sheets = getSheetInstance();

  let id = 0;
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

  const rutFolderId = foldersIdResponse.data.values[0][1];

  // Update rut file
  let rutFileUrl = "";
  if (payload.rutFile !== null) {
    rutFileUrl = await uploadRutFile(
      payload.document,
      rutFolderId,
      payload.rutFile.mimeType,
      payload.rutFile.rawData,
    );
  }


  rows.push([
    id,
    payload.firstName,
    payload.lastName,
    payload.documentType,
    payload.document,
    payload.phone,
    payload.email,
    payload.bankType,
    payload.accountType,
    payload.accountNumber,
    rutFileUrl
  ]);

  validateSheetResponse(
    await sheetsAppend(
      sheets,
      googleAuth,
      spreadsheetId,
      sheetName + "!A3:K",
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
 * Update Supplier.
 * @param {any} spreadsheetId spreadsheetId value.
 * @param {any} payload payload value.
 */
export async function update(
  payload: any,
): Promise<any> {
  const sheets = getSheetInstance();
  const rows: any[][] = [];

  const foldersIdResponse = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    sheetName + "!C1:D1",
  );

  validateSheetResponse(foldersIdResponse);

  // Update rut file
  const rutFileUrl = await updateRutFile(
    payload,
    foldersIdResponse.data.values[0][1]
  );

  rows.push([
    payload.id,
    payload.firstName,
    payload.lastName,
    payload.documentType,
    payload.document,
    payload.phone,
    payload.email,
    payload.bankType,
    payload.accountType,
    payload.accountNumber,
    rutFileUrl
  ]);

  validateSheetResponse(
    await sheetUpdateRows(
      sheets,
      googleAuth,
      spreadsheetId,
      sheetName + "!A" + payload.position + ":K" + payload.position,
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
