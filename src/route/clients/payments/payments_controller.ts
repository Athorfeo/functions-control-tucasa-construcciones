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
  DRIVE_URL_FILE_PATH,
  getDriveInstance,
  uploadFile,
  deleteFile,
} from "../../../util/drive_util";

export const sheetName = "viviendas";

/**
 * Upload rut file.
 * @param {any} document of rut owner.
 * @param {any} folderId folder id.
 * @param {any} mimeType mimeType file.
 * @param {any} rawData mimeType file.
 */
export async function uploadFileController(
  filename: string,
  folderId: string,
  mimeType: string,
  rawData: string,
): Promise<any> {
  const driveService = getDriveInstance();

  const uploadFileResponse = await uploadFile(
    driveService,
    folderId,
    filename,
    mimeType,
    rawData,
  );

  const fileUrl = DRIVE_URL_FILE_PATH + uploadFileResponse.id;

  return fileUrl;
}

/**
 * Upload promise file.
 * @param {any} document of rut owner.
 * @param {any} folderId folder id.
 * @param {any} mimeType mimeType file.
 * @param {any} rawData mimeType file.
 */
export async function uploadPromiseFile(
  document: string,
  numberHousehold: string,
  folderId: string,
  mimeType: string,
  rawData: string,
): Promise<any> {
  const fileExtension = mimeType.split("/")[1];

  const filenameBuilder = [];
  filenameBuilder.push(
    "promise",
    "-",
    numberHousehold,
    "-",
    document,
    ".",
    fileExtension,
  );
  const filename = filenameBuilder.join("");

  return uploadFileController(
    filename,
    folderId,
    mimeType,
    rawData
  );
}

/**
 * Upload invoice file.
 * @param {any} document of rut owner.
 * @param {any} folderId folder id.
 * @param {any} mimeType mimeType file.
 * @param {any} rawData mimeType file.
 */
export async function uploadInvoiceFile(
  document: string,
  numberHousehold: string,
  folderId: string,
  mimeType: string,
  rawData: string,
): Promise<any> {
  const fileExtension = mimeType.split("/")[1];

  const filenameBuilder = [];
  filenameBuilder.push(
    "invoice",
    "-",
    numberHousehold,
    "-",
    document,
    ".",
    fileExtension,
  );
  const filename = filenameBuilder.join("");

  return uploadFileController(
    filename,
    folderId,
    mimeType,
    rawData
  );
}

/**
 * Upload minute file.
 * @param {any} document of rut owner.
 * @param {any} folderId folder id.
 * @param {any} mimeType mimeType file.
 * @param {any} rawData mimeType file.
 */
export async function uploadMinuteFile(
  document: string,
  numberHousehold: string,
  folderId: string,
  mimeType: string,
  rawData: string,
): Promise<any> {
  const fileExtension = mimeType.split("/")[1];

  const filenameBuilder = [];
  filenameBuilder.push(
    "minute",
    "-",
    numberHousehold,
    "-",
    document,
    ".",
    fileExtension,
  );
  const filename = filenameBuilder.join("");

  return uploadFileController(
    filename,
    folderId,
    mimeType,
    rawData
  );
}

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
  const minuteFolderId = foldersIdResponse.data.values[0][5];

  const promiseFileUrl = await uploadPromiseFile(
    payload.document,
    payload.numberHousehold,
    promiseFolderId,
    payload.promiseFile.mimeType,
    payload.promiseFile.rawData,
  );

  const invoiceFileUrl = await uploadInvoiceFile(
    payload.document,
    payload.numberHousehold,
    invoiceFolderId,
    payload.invoiceFile.mimeType,
    payload.invoiceFile.rawData,
  );

  const minuteFileUrl = await uploadMinuteFile(
    payload.document,
    payload.numberHousehold,
    minuteFolderId,
    payload.minuteFile.mimeType,
    payload.minuteFile.rawData,
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
    minuteFileUrl,
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
  const driveService = getDriveInstance();
  const createdDate = getDateFormatted();
  const rows: any[][] = [];

  const foldersIdResponse = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    sheetName + "!C1:H1",
  );

  validateSheetResponse(foldersIdResponse);
  
  // Update primiseFile
  let promiseFileUrl = "";
  if (
    payload.promiseFile.mimeType != undefined &&
    payload.promiseFile.rawData != undefined
  ) {
    const promisePayloadFileUrl = payload.promiseFile.fileUrl;
    const promiseFileId = promisePayloadFileUrl.split(DRIVE_URL_FILE_PATH)[1];

    // Delete image
    await deleteFile(
      driveService,
      promiseFileId,
    );

    const promiseFolderId = foldersIdResponse.data.values[0][1];
    promiseFileUrl = await uploadPromiseFile(
      payload.document,
      payload.numberHousehold,
      promiseFolderId,
      payload.promiseFile.mimeType,
      payload.promiseFile.rawData,
    );
  } else {
    promiseFileUrl = payload.promiseFile.fileUrl;
  }

  
  // Update invoice file
  let invoiceFileUrl = "";
  if (
    payload.invoiceFile.mimeType != undefined &&
    payload.invoiceFile.rawData != undefined
  ) {
    const invoicePayloadFileUrl = payload.invoiceFile.fileUrl;
    const invoiceFileId = invoicePayloadFileUrl.split(DRIVE_URL_FILE_PATH)[1];

    // Delete image
    await deleteFile(
      driveService,
      invoiceFileId,
    );

    const invoiceFolderId = foldersIdResponse.data.values[0][3];
    invoiceFileUrl = await uploadInvoiceFile(
      payload.document,
      payload.numberHousehold,
      invoiceFolderId,
      payload.invoiceFile.mimeType,
      payload.invoiceFile.rawData,
    );
  } else {
    invoiceFileUrl = payload.invoiceFile.fileUrl;
  }

  // Update minute file
  let minuteFileUrl = "";
  if (
    payload.minuteFile.mimeType != undefined &&
    payload.minuteFile.rawData != undefined
  ) {
    const minutePayloadFileUrl = payload.minuteFile.fileUrl;
    const minuteFileId = minutePayloadFileUrl.split(DRIVE_URL_FILE_PATH)[1];

    // Delete image
    await deleteFile(
      driveService,
      minuteFileId,
    );

    const minuteFolderId = foldersIdResponse.data.values[0][5];
    minuteFileUrl = await uploadMinuteFile(
      payload.document,
      payload.numberHousehold,
      minuteFolderId,
      payload.minuteFile.mimeType,
      payload.minuteFile.rawData,
    );
  } else {
    minuteFileUrl = payload.minuteFile.fileUrl;
  }

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
    minuteFileUrl,
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
