import {googleAuth} from "../../util/google_auth";
import {
  CONTROL_SHEETS,
  getSheetInstance,
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
  let code = 500;
  let payloadResponse = null;

  try {
    const spreadsheetId = CONTROL_SHEETS.data.spreadsheetId;
    const sheets = getSheetInstance();
    const sheetQuery = await sheetsGet(
      sheets,
      googleAuth,
      spreadsheetId,
      "usuario!A3:C",
    );

    const found = sheetQuery.data.values.find((item: any[]) => {
      return item[1] == req.params.email;
    });

    if (found !== undefined) {
      payloadResponse = {
        id: found[0],
        email: found[1],
        rol: found[2],
      };
      code = 200;
    } else {
      code = 404;
    }
  } catch {
    code = 400;
  }

  // Response
  let response = null;
  if (code >= 200 && code < 400) {
    response = JSON.stringify({
      data: payloadResponse,
    });
  }

  res.status(code).send(response);
});
