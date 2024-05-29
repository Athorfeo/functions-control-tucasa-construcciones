import {
  DRIVE_URL_FILE_PATH,
  getDriveInstance,
  uploadFile,
  deleteFile,
  updateFilename,
  getFile,
} from "../../../util/drive_util";

/**
 * Get Payment filename.
 * @param {any} payload of Payment household client.
 * @param {any} mimeType mimeType file.
 * @return {string} filename.
 */
export function getPaymentFilename(
  payload: any,
  mimeType: string,
): string {
  const fileExtension = mimeType.split("/")[1];

  const filenameBuilder = [];
  filenameBuilder.push(
    "pago",
    "-",
    payload.document,
    ".",
    fileExtension,
  );

  return filenameBuilder.join("");
}

/**
 * Upload Payment file.
 * @param {any} payload of Payment client.
 * @param {any} folderId folder id.
 */
export async function uploadPaymentFile(
  payload: any,
  folderId: string,
): Promise<any> {
  const driveService = getDriveInstance();
  const payloadFile = payload.paymentFile;
  const filename = getPaymentFilename(
    payload,
    payloadFile.mimeType
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
 * Update Payment file.
 * @param {any} payload of Payment household client.
 * @param {any} folderId folder id.
 */
export async function updatePaymentFile(
  payload: any,
  folderId: string,
): Promise<any> {
  const driveService = getDriveInstance();
  let fileUrl = "";

  const payloadFile = payload.paymentFile;
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

    fileUrl = await uploadPaymentFile(
      payload,
      folderId
    );
  } else {
    const currentFile = await getFile(
      driveService,
      fileId,
    );

    const filename = getPaymentFilename(
      payload,
      currentFile.mimeType
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


/**
 * Delete Payment file.
 * @param {any} payload of Payment client.
 */
export async function deletePaymentFile(
  payload: any
) {
  const driveService = getDriveInstance();
  const payloadFileUrl = payload.paymentFileUrl;
  const fileId = payloadFileUrl.split(DRIVE_URL_FILE_PATH)[1];
  await deleteFile(
    driveService,
    fileId,
  );
}
