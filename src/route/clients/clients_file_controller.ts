import {
  DRIVE_URL_FILE_PATH,
  getDriveInstance,
  uploadFile,
  deleteFile,
  updateFilename,
  getFile,
} from "../../util/drive_util";

/**
 * Get rut filename.
 * @param {any} document of rut owner.
 * @param {any} mimeType mimeType file.
 */
export function getRutFilename(
  document: string,
  mimeType: string,
): string {
  const fileExtension = mimeType.split("/")[1];

  const filenameBuilder = [];
  filenameBuilder.push(
    "rut",
    "-",
    document,
    ".",
    fileExtension,
  );
  return filenameBuilder.join("");
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
  const filename = getRutFilename(document, mimeType);

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
 * Update rut file.
 * @param {any} payload of rut owner.
 * @param {any} folderId folder id.
 */
export async function updateRutFile(
  payload: any,
  folderId: string,
): Promise<any> {
  const driveService = getDriveInstance();
  let fileUrl = "";

  const payloadFileUrl = payload.rutFile.fileUrl;
  const fileId = payloadFileUrl.split(DRIVE_URL_FILE_PATH)[1];

  if (
    payload.rutFile.mimeType != undefined &&
    payload.rutFile.rawData != undefined
  ) {
    await deleteFile(
      driveService,
      fileId,
    );

    fileUrl = await uploadRutFile(
      payload.document,
      folderId,
      payload.rutFile.mimeType,
      payload.rutFile.rawData,
    );
  } else {
    const currentFile = await getFile(
      driveService,
      fileId,
    );

    const filename = getRutFilename(payload.document, currentFile.mimeType);

    await updateFilename(
      driveService,
      fileId,
      filename,
    );

    fileUrl = payload.rutFile.fileUrl;
  }

  return fileUrl;
}

/**
 * Get document filename.
 * @param {any} document of rut owner.
 * @param {any} mimeType mimeType file.
 */
export function getDocumentFilename(
  document: string,
  mimeType: string,
): string {
  const fileExtension = mimeType.split("/")[1];

  const filenameBuilder = [];
  filenameBuilder.push(
    "document",
    "-",
    document,
    ".",
    fileExtension,
  );
  return filenameBuilder.join("");
}

/**
 * Upload document file.
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
  const filename = getDocumentFilename(document, mimeType);

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
 * Update rut file.
 * @param {any} payload of rut owner.
 * @param {any} folderId folder id.
 */
export async function updateDocumentFile(
  payload: any,
  folderId: string,
): Promise<any> {
  const driveService = getDriveInstance();
  let fileUrl = "";

  const payloadFile = payload.documentFile;
  const payloadFileUrl = payloadFile.fileUrl;
  const fileId = payloadFileUrl.split(DRIVE_URL_FILE_PATH)[1];

  if (
    payloadFile.mimeType != undefined &&
    payloadFile.rawData != undefined
  ) {
    await deleteFile(
      driveService,
      fileId,
    );

    fileUrl = await uploadDocumentFile(
      payload.document,
      folderId,
      payloadFile.mimeType,
      payloadFile.rawData,
    );
  } else {
    const currentFile = await getFile(
      driveService,
      fileId,
    );

    const filename = getRutFilename(payload.document, currentFile.mimeType);

    await updateFilename(
      driveService,
      fileId,
      filename,
    );

    fileUrl = payloadFile.fileUrl;
  }

  return fileUrl;
}
