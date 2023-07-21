import {googleAuth} from "../../util/google_auth";
import {
  CONTROL_SHEETS,
  getSheetInstance,
  sheetsGet,
} from "../../util/sheets_util";
import express = require("express");

export const route = express.Router();
const spreadsheetId = CONTROL_SHEETS.data.spreadsheetId;
const sheetName = "contractors";

route.use((_req: any, _res: any, next: () => void) => {
  next();
});

/**
 * Get all contractors
 * Developed by Juan Ortiz
 */
route.get("/", async (req: any, res: any) => {
  const sheets = getSheetInstance();
  const sheetQuery = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    sheetName + "!A3:J",
  );

  const response = {
    data: {
      contractors: sheetQuery.data.values,
    },
  };

  res.status(200).send(response);
});
