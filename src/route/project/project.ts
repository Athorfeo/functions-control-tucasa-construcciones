import {google} from "googleapis";
import {googleAuth} from "../../util/google_auth";
import {sheetsGet} from "../../util/sheets_util";
import express = require("express");

/**
 * Projects Route
 * Developed by Juan Ortiz
 */
export const route = express.Router();
const spreadsheetId = "1VuxV5doIkDNis3THLZ5ObF6mRjshIb-CdsHf-65C9fw";

route.use((_req: any, _res: any, next: () => void) => {
  console.log("Purchase Order | Time: ", Date.now());
  next();
});

// get(/)
route.get("/", async (req: any, res: any) =>{
  const sheets = google.sheets({version: "v4", auth: googleAuth});
  const sheetQuery = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    "Proyecto!A3:D",
  );
  const response = {
    "projects": sheetQuery.data.values,
  };
  console.log("Sending response...");
  res.send(response);
});

