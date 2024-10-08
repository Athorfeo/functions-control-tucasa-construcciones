import {
  DRIVE_URL_FILE_PATH,
  getDriveInstance,
  uploadFile,
  deleteFile,
  updateFilename,
  getFile,
} from "../../../util/drive_util";

/**
 * Get rut filename.
 * @param {any} document of rut owner.
 * @param {any} mimeType mimeType file.
 * @return {string} filename.
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
 * @return {Promise<any>} promise for result to upload file.
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
 * @return {Promise<any>} promise for result to update file.
 */
export async function updateRutFile(
  payload: any,
  folderId: string,
): Promise<any> {
  const driveService = getDriveInstance();
  let fileUrl = "";

  const payloadFileUrl = payload.rutFile.fileUrl;

  let fileId = null;
  if (payloadFileUrl !== "") {
    fileId = payloadFileUrl.split(DRIVE_URL_FILE_PATH)[1];
  }

  if (
    payload.rutFile.mimeType != undefined &&
    payload.rutFile.rawData != undefined
  ) {
    if (fileId !== null) {
      try {
        await deleteFile(
          driveService,
          fileId,
        );
      } catch (exception) {
        // Error
      }
    }

    fileUrl = await uploadRutFile(
      payload.document,
      folderId,
      payload.rutFile.mimeType,
      payload.rutFile.rawData,
    );
  } else if (fileId !== null) {
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
