import {
  DRIVE_URL_FILE_PATH,
  getDriveInstance,
  uploadFile,
  deleteFile,
  updateFilename,
  getFile,
} from "../../../util/drive_util";

/**
 * Get promise filename.
 * @param {any} payload of promise household client.
 * @param {any} mimeType mimeType file.
 * @return {string} filename.
 */
export function getPromiseFilename(
  payload: any,
  mimeType: string,
): string {
  const fileExtension = mimeType.split("/")[1];

  const filenameBuilder = [];
  filenameBuilder.push(
    "promesa",
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
 * Upload promise file.
 * @param {any} payload of promise household client.
 * @param {any} folderId folder id.
 */
export async function uploadPromiseFile(
  payload: any,
  folderId: string,
): Promise<any> {
  const driveService = getDriveInstance();
  const payloadFile = payload.promiseFile;
  const filename = getPromiseFilename(payload, payloadFile.mimeType);

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
 * Update promise file.
 * @param {any} payload of promise household client.
 * @param {any} folderId folder id.
 */
export async function updatePromiseFile(
  payload: any,
  folderId: string,
): Promise<any> {
  const driveService = getDriveInstance();
  let fileUrl = "";

  const payloadFile = payload.promiseFile;
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

    fileUrl = await uploadPromiseFile(
      payload,
      folderId
    );
  } else {
    const currentFile = await getFile(
      driveService,
      fileId,
    );

    const filename = getPromiseFilename(
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
 * Delete promise file.
 * @param {any} payload of Promise household client.
 */
export async function deletePromiseFile(
  payload: any
) {
  const driveService = getDriveInstance();
  const payloadFileUrl = payload.promiseFileUrl;
  const fileId = payloadFileUrl.split(DRIVE_URL_FILE_PATH)[1];
  await deleteFile(
    driveService,
    fileId,
  );
}
