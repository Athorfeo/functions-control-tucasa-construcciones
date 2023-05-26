import {google} from "googleapis";
import {googleAuth as auth} from "../../util/google_auth";
import {CONTROL_SHEETS, sheetsGet} from "../../util/sheets_util";
import express = require("express");

export const routeChapters = express.Router();
const spreadsheetId = CONTROL_SHEETS.data.spreadsheetId;

routeChapters.use((_req: any, _res: any, next: () => void) => {
  console.log("Data Chapters | Time: ", Date.now());
  next();
});

routeChapters.get("/", async (_req: any, res: any) => {
  console.log("Data Chapters | Get Rows");

  const sheets = google.sheets({version: "v4", auth: await auth});
  const rawRows = await sheetsGet(sheets, auth, spreadsheetId, "chapters!A3:B");

  const rows: any[] = [];
  rawRows.data.values.forEach((item: any[]) => {
    rows.push({id: item[0], name: item[1]});
  });

  res.send({data: rows});
});
