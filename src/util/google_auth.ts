import {google} from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.appdata",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
];
const CREDENTIALS_PATH = "src/credentials.json";

/**
 * Get a Google Auth instance.
 * @return {GoogleAuth<JSONClient>} GoogleAuth instance.
 */
function getGoogleAuth() {
  return new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES,
  });
}

/**
 * Get Google Auth.
 * @return Google Auth.
 */
export const googleAuth = getGoogleAuth();

/**
 * Validate google response
 * @param {any} response google response.
 */
export function validateGoogleResponse(response: any) {
  if (response.status < 200 && response.status >= 300) {
    throw Error("Google service status error: " + response.status);
  }
}
