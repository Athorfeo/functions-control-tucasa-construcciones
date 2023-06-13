import {google} from "googleapis";

const SCOPES = [
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
