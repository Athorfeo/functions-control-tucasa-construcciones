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
  DRIVE_URL_FILE_PATH,
  getDriveInstance,
  uploadFile,
  deleteFile,
} from "../../util/drive_util";

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
  let rutFileUrl= "";
  let documentFileUrl = "";

  if (values[6] != undefined) {
    rutFileUrl = values[6];
  }

  if (values[7] != undefined) {
    documentFileUrl = values[7];
  }

  const data = {
    position: position,
    id: values[0],
    createdDate: values[1],
    document: values[2],
    name: values[3],
    address: values[4],
    email: values[5],
    rutFileUrl: rutFileUrl,
    documentFileUrl: documentFileUrl,
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
  const range = sheetName + "!A" + position + ":H" + position;
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
 * Upload rut file.
 * @param {any} document of rut owner.
 * @param {any} folderId folder id.
 * @param {any} mimeType mimeType file.
 * @param {any} rawData mimeType file.
 */
export async function uploadRutFile(
  document: string,
  folderId: string,
  mimeType: string,
  rawData: string,
): Promise<any> {
  const driveService = getDriveInstance();
  const rutFileExtension = mimeType.split("/")[1];

  const filenameBuilder = [];
  filenameBuilder.push(
    "rut",
    "-",
    document,
    ".",
    rutFileExtension,
  );
  const rutFilename = filenameBuilder.join("");

  const uploadFileResponse = await uploadFile(
    driveService,
    folderId,
    rutFilename,
    mimeType,
    rawData,
  );

  const fileUrl = DRIVE_URL_FILE_PATH + uploadFileResponse.id;

  return fileUrl;
}

/**
 * Upload rut file.
 * @param {any} document of rut owner.
 * @param {any} folderId folder id.
 * @param {any} mimeType mimeType file.
 * @param {any} rawData mimeType file.
 */
export async function uploadDocumentFile(
  document: string,
  folderId: string,
  mimeType: string,
  rawData: string,
): Promise<any> {
  const driveService = getDriveInstance();
  const rutFileExtension = mimeType.split("/")[1];

  const filenameBuilder = [];
  filenameBuilder.push(
    "document",
    "-",
    document,
    ".",
    rutFileExtension,
  );
  const rutFilename = filenameBuilder.join("");

  const uploadFileResponse = await uploadFile(
    driveService,
    folderId,
    rutFilename,
    mimeType,
    rawData,
  );

  const fileUrl = DRIVE_URL_FILE_PATH + uploadFileResponse.id;

  return fileUrl;
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

  const foldersIdResponse = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    sheetName + "!C1:F1",
  );

  validateSheetResponse(foldersIdResponse);
  
  // Update rutFile
  let rutFileUrl = "";
  if (
    payload.rutFile.mimeType != undefined &&
    payload.rutFile.rawData != undefined
  ) {
    const rutPayloadFileUrl = payload.rutFile.fileUrl;
    const rutFileId = rutPayloadFileUrl.split(DRIVE_URL_FILE_PATH)[1];

    // Delete image
    await deleteFile(
      driveService,
      rutFileId,
    );

    const rutFolderId = foldersIdResponse.data.values[0][1];
    rutFileUrl = await uploadRutFile(
      payload.document,
      rutFolderId,
      payload.rutFile.mimeType,
      payload.rutFile.rawData,
    );
  } else {
    rutFileUrl = payload.rutFile.fileUrl;
  }

  
  // Update Document File
  let documentFileUrl = "";
  if (
    payload.documentFile.mimeType != undefined &&
    payload.documentFile.rawData != undefined
  ) {
    const documentPayloadFileUrl = payload.documentFile.fileUrl;
    const documentFileId = documentPayloadFileUrl.split(DRIVE_URL_FILE_PATH)[1];

    // Delete image
    await deleteFile(
      driveService,
      documentFileId,
    );

    const documentFolderId = foldersIdResponse.data.values[0][3];
    documentFileUrl = await uploadRutFile(
      payload.document,
      documentFolderId,
      payload.documentFile.mimeType,
      payload.documentFile.rawData,
    );
  } else {
    documentFileUrl = payload.documentFile.fileUrl;
  }

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
