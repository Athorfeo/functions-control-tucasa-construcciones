import {google} from "googleapis";
import {googleAuth, validateGoogleResponse} from "./google_auth";
import {Readable} from 'stream';

/**
 * Get a Google Drive instance.
 * @return {drive_v3.Drive} GoogleAuth instance.
 */
export function getDriveInstance() {
  return google.drive({ version: "v3", auth: googleAuth });
}

/**
 * Upload image.
 * @param {any} service Drive instance.
 * @param {any} folderId spreadsheetId value.
 * @param {string} filename range of sheet.
 * @param {any} mimeType rows to append.
 * @param {any} rawData rows to append.
 * @return {Promise<any>} result of execution.
 */
export async function uploadFile(
  service: any,
  folderId: string,
  filename: string,
  mimeType: string,
  rawData: string,
): Promise<any> {
  var rawFile = rawData.split(',')[1];
  const buffer = Buffer.from(rawFile, 'base64');
  const readable = Readable.from(buffer);

  const fileMetadata = {
    name: filename,
    parents: [folderId],
  };

  const media = {
    mimeType: mimeType,
    body: readable,
  };

  const response = await service.files.create({
    resource: fileMetadata,
    media: media
  });

  validateGoogleResponse(response);

  return response.data;
}

/**
 * Delete file.
 * @param {any} service Drive instance.
 * @param {any} fileId file id.
 */
export async function deleteFile(
  service: any,
  fileId: string,
): Promise<any> {
  const response = await service.files.delete({
    fileId: fileId
  });

  validateGoogleResponse(response);

  return response.data;
}