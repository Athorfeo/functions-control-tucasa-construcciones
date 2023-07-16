import {googleAuth} from "../../util/google_auth";
import {
  CONTROL_SHEETS,
  getSheetInstance,
  sheetsGet,
} from "../../util/sheets_util";
import express = require("express");

/**
 * Projects Route
 * Developed by Juan Ortiz
 */
export const route = express.Router();
const spreadsheetId = CONTROL_SHEETS.data.spreadsheetId;
const sheetName = "proyecto";

route.use((_req: any, _res: any, next: () => void) => {
  next();
});

/**
 * Get all projects
 * Developed by Juan Ortiz
 */
route.get("/", async (req: any, res: any) => {
  const sheets = getSheetInstance();
  const sheetQuery = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    sheetName + "!A3:R",
  );

  console.log(sheetQuery.data.values);
  const validateSpreadsheetId = (item: any) => {
    if (item === undefined || item === "") {
      return "";
    } else {
      return item;
    }
  };

  const projects = sheetQuery.data.values.map((item: any) => {
    return {
      id: item[0],
      name: item[1],
      company: item[2],
      purchase: {
        pettyCash: validateSpreadsheetId(item[3]),
        invoice: validateSpreadsheetId(item[4]),
        tax: validateSpreadsheetId(item[5]),
        order: validateSpreadsheetId(item[6]),
      },
      service: {
        minute: validateSpreadsheetId(item[7]),
        paymentContractors: validateSpreadsheetId(item[8]),
      },
      client: {
        payment: validateSpreadsheetId(item[9]),
        client: validateSpreadsheetId(item[10]),
      },
      statement: {
        montlyBank: validateSpreadsheetId(item[11]),
        weeklyBank: validateSpreadsheetId(item[12]),
      },
      patner: {
        contributions: validateSpreadsheetId(item[13]),
        patner: validateSpreadsheetId(item[14]),
        borrow: validateSpreadsheetId(item[15]),
      },
      supplier: {
        supplier: validateSpreadsheetId(item[16]),
      },
      aftersale: {
        aftersale: validateSpreadsheetId(item[17]),
      },
    };
  });

  const response = {
    data: {
      projects: projects,
    },
  };

  res.status(200).send(response);
});
