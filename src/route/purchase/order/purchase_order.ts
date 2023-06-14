import {google} from "googleapis";
import {googleAuth} from "../../../util/google_auth";
import {
  sheetsGet,
  sheetsAppend,
  getRawLastId,
  updateLastId,
  sheetUpdateRows,
} from "../../../util/sheets_util";
import express = require("express");

/**
 * Projects Route
 * Developed by Juan Ortiz
 */
export const routePurchaseOrder = express.Router();

routePurchaseOrder.use((_req: any, _res: any, next: () => void) =>{
  next();
});

/**
 * Get all
 * Developed by Juan Ortiz
 */
routePurchaseOrder.get("/", async (req: any, res: any) =>{
  const spreadsheetId = req.get("Spreadsheet-Id");
  const sheets = google.sheets({version: "v4", auth: googleAuth});
  const sheetQuery = await sheetsGet(
    sheets,
    googleAuth,
    spreadsheetId,
    "Sheet1!A3:H",
  );

  const response = {
    code: 0,
    data: sheetQuery.data,
  };

  res.status(200).send(JSON.stringify(response));
});

/**
 * Get by range
 * Developed by Juan Ortiz
 */
routePurchaseOrder.get("/range", async (req: any, res: any) =>{
  const spreadsheetId = req.get("Spreadsheet-Id");
  const startPosition = req.query.start;
  const endPosition = req.query.end;

  if (startPosition !== undefined && endPosition !== undefined) {
    const range = "Sheet1!A" + startPosition + ":H" + endPosition;
    const sheets = google.sheets({version: "v4", auth: googleAuth});
    const sheetQuery = await sheetsGet(
      sheets,
      googleAuth,
      spreadsheetId,
      range,
    );

    const response = {
      code: 0,
      data: sheetQuery.data,
    };

    res.status(200).send(JSON.stringify(response));
  } else {
    const response = {
      code: -1,
    };

    res.status(400).send(JSON.stringify(response));
  }
});

/**
 * Append
 * Developed by Juan Ortiz
 */
routePurchaseOrder.put(
  "/",
  async (req: any, res: any) =>{
    console.log("Purchase Order | Append row");
    console.log(`RequestBody: ${JSON.stringify(req.body)}`);

    const spreadsheetId = req.get("Spreadsheet-Id");
    const payload = req.body.payload;
    const sheets = google.sheets({version: "v4", auth: googleAuth});

    try {
      let lastId = 0;
      const rawLastId = await getRawLastId(
        sheets,
        googleAuth,
        spreadsheetId,
        "Sheet1!B1",
      );

      if (rawLastId >= 0) {
        lastId = rawLastId + 1;
      }

      const rawDate = new Date();
      const day = rawDate.getDate();
      const month = (rawDate.getMonth() + 1);
      const year = rawDate.getFullYear();
      const date = `${day}/${(month)}/${year}`;

      const rows: any[][] = [];
      payload.products.forEach((product: any) =>{
        rows.push([
          lastId,
          date,
          payload.observations,
          payload.supplierName,
          product.productName,
          product.productQuantity,
          product.chapterName,
          0,
        ]);
      });

      await sheetsAppend(
        sheets,
        googleAuth,
        spreadsheetId,
        "Sheet1!A3:H",
        rows
      );

      await updateLastId(
        sheets,
        googleAuth,
        spreadsheetId,
        "Sheet1!B1",
        lastId,
      );

      const response = {
        code: 0,
      };

      res.status(201).send(JSON.stringify(response));
    } catch (error) {
      console.log(error);

      const response ={
        code: -1,
      };

      res.status(500).send(JSON.stringify(response));
    }
  });

/**
 * Update
 * Developed by Juan Ortiz
 */
routePurchaseOrder.post(
  "/update",
  async (req: any, res: any) =>{
    const spreadsheetId = req.get("Spreadsheet-Id");
    const payload = req.body.payload;
    const sheets = google.sheets({version: "v4", auth: googleAuth});

    try {
      const rawDate = new Date();
      const day = rawDate.getDate();
      const month = (rawDate.getMonth() + 1);
      const year = rawDate.getFullYear();
      const date = `${day}/${(month)}/${year}`;

      const rows: any[][] = [];
      payload.products.forEach((product: any) => {
        rows.push([
          payload.id,
          date,
          payload.observations,
          payload.supplierName,
          product.productName,
          product.productQuantity,
          product.chapterName,
          0,
        ]);
      });

      const range = (
        "Sheet1!A" +
        payload.startPosition +
        ":H" +
        payload.endPosition
      );

      await sheetUpdateRows(sheets, googleAuth, spreadsheetId, range, rows);

      const response = {
        code: 0,
      };

      res.status(200).send(JSON.stringify(response));
    } catch (error) {
      console.log(error);

      const response = {
        code: -1,
      };

      res.status(500).send(JSON.stringify(response));
    }
  }
);

/**
 * Approve
 * Developed by Juan Ortiz
 */
routePurchaseOrder.post(
  "/approve",
  async (req: any, res: any) =>{
    try {
      const spreadsheetId = req.get("Spreadsheet-Id");
      const payload = req.body.payload;
      const sheets = google.sheets({
        version: "v4",
        auth: googleAuth,
      });

      const startPosition = payload.startPosition;
      const endPosition = payload.endPosition;
      const rowAffected = (endPosition - startPosition);
      const rows: any[][] = [];

      for (let i = 0; i <= rowAffected; i++) {
        rows.push([
          1,
        ]);
      }

      const range = "Sheet1!H" + startPosition + ":H" + endPosition;
      await sheetUpdateRows(sheets, googleAuth, spreadsheetId, range, rows);

      const response = {
        code: 0,
      };

      res.status(200).send(JSON.stringify(response));
    } catch (error) {
      console.log(error);

      const response = {
        code: -1,
      };

      res.status(500).send(JSON.stringify(response));
    }
  }
);
