import { google } from "googleapis";
import { googleAuth } from "../../util/google_auth";
import {
  CONTROL_SHEETS,
  sheetsGet,
} from "../../util/sheets_util";
import express = require("express");

/**
 * User Route
 * Developed by Juan Ortiz
 */
export const route = express.Router();

route.use((_req: any, _res: any, next: () => void) => {
  next();
});

/**
 * Get user by email
 * Developed by Juan Ortiz
 */
route.get("/:email", async (req: any, res: any) => {
  try {
    const spreadsheetId = CONTROL_SHEETS.data.spreadsheetId;
    const sheets = google.sheets({ version: "v4", auth: googleAuth });
    const sheetQuery = await sheetsGet(
      sheets,
      googleAuth,
      spreadsheetId,
      "user!A3:C",
    );

    const found = sheetQuery.data.values.find((item: any[]) => item[1] == req.params.email);

    if (found !== undefined) {
      const response = {
        code: 0,
        data: found,
      };
    
      res.status(200).send(JSON.stringify(response));
    } else {
      const response = {
        code: -2,
      };
  
      res.status(404).send(JSON.stringify(response));
    }
  } catch {
    const response = {
      code: -1,
    };

    res.status(400).send(JSON.stringify(response));
  }
});
