import {
  DRIVE_URL_FILE_PATH,
  getDriveInstance,
  uploadFile,
  deleteFile,
  updateFilename,
  getFile,
} from "../../../util/drive_util";

/**
 * Get Certificate filename.
 * @param {any} payload of Certificate household client.
 * @param {any} mimeType mimeType file.
 * @return {string} filename.
 */
export function getCertificateFilename(
  payload: any,
  mimeType: string,
): string {
  const fileExtension = mimeType.split("/")[1];

  const filenameBuilder = [];
  filenameBuilder.push(
    "acta",
    "-",
    "entrega",
    "-",
    payload.document,
    "-",
    payload.numberHousehold,
    ".",
    fileExtension,
  );

  return filenameBuilder.join("");
}

/**
 * Upload Certificate file.
 * @param {any} payload of Certificate household client.
 * @param {any} folderId folder id.
 */
export async function uploadCertificateFile(
  payload: any,
  folderId: string,
): Promise<any> {
  const driveService = getDriveInstance();
  const payloadFile = payload.certificateFile;
  const filename = getCertificateFilename(
    payload,
    payloadFile.mimeType,
  );

  const uploadFileResponse = await uploadFile(
    driveService,
    folderId,
    filename,
    payloadFile.mimeType,
    payloadFile.rawData,
  );

  const fileUrl = DRIVE_URL_FILE_PATH + uploadFileResponse.id;

  return fileUrl;
}

/**
 * Update Certificate file.
 * @param {any} payload of Certificate household client.
 * @param {any} folderId folder id.
 */
export async function updateCertificateFile(
  payload: any,
  folderId: string,
): Promise<any> {
  const driveService = getDriveInstance();
  let fileUrl = "";

  const payloadFile = payload.certificateFile;
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

    fileUrl = await uploadCertificateFile(
      payload,
      folderId
    );
  } else {
    const currentFile = await getFile(
      driveService,
      fileId,
    );

    const filename = getCertificateFilename(
      payload,
      currentFile.mimeType,
    );

    await updateFilename(
      driveService,
      fileId,
      filename,
    );

    fileUrl = payloadFile.fileUrl;
  }

  return fileUrl;
}
