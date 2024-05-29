import {
  DRIVE_URL_FILE_PATH,
  getDriveInstance,
  uploadFile,
  deleteFile,
  updateFilename,
  getFile,
} from "../../../util/drive_util";

/**
 * Get invoice filename.
 * @param {any} payload of invoice household client.
 * @param {any} mimeType mimeType file.
 * @return {string} filename.
 */
export function getInvoiceFilename(
  payload: any,
  mimeType: string,
): string {
  const fileExtension = mimeType.split("/")[1];

  const filenameBuilder = [];
  filenameBuilder.push(
    "factura",
    "-",
    "venta",
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
 * Upload invoice file.
 * @param {any} payload of invoice household client.
 * @param {any} folderId folder id.
 */
export async function uploadInvoiceFile(
  payload: any,
  folderId: string,
): Promise<any> {
  const driveService = getDriveInstance();
  const payloadFile = payload.invoiceFile;
  const filename = getInvoiceFilename(
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
 * Update invoice file.
 * @param {any} payload of invoice household client.
 * @param {any} folderId folder id.
 */
export async function updateInvoiceFile(
  payload: any,
  folderId: string,
): Promise<any> {
  const driveService = getDriveInstance();
  let fileUrl = "";

  const payloadFile = payload.invoiceFile;
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

    fileUrl = await uploadInvoiceFile(
      payload,
      folderId
    );
  } else {
    const currentFile = await getFile(
      driveService,
      fileId,
    );

    const filename = getInvoiceFilename(
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
 * Delete invoice file.
 * @param {any} payload of Invoice household client.
 */
export async function deleteInvoiceFile(
  payload: any
) {
  const driveService = getDriveInstance();
  const payloadFileUrl = payload.invoiceFileUrl;
  const fileId = payloadFileUrl.split(DRIVE_URL_FILE_PATH)[1];
  await deleteFile(
    driveService,
    fileId,
  );
}
