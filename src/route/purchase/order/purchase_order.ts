import {google} from "googleapis";
import {googleAuth, googleAuthClient} from "../../../util/google_auth";
import {
  sheetsGet,
  sheetsAppend,
  getRawLastId,
  updateLastId
} from "../../../util/sheets_util";
import express = require("express");

export const routePurchaseOrder = express.Router();
const spreadsheetId = "1z_FUx2u9GsTMdZJSk2PvsXwjdQga21ap8iPGJX1dFwU";

routePurchaseOrder.use((_req: any, _res: any, next: () => void) => {
  console.log("Purchase Order | Time: ", Date.now());
  next();
});

routePurchaseOrder.get("/", async (req: any, res: any) => {
  console.log("Purchase Order | Get Rows");

  const sheets = google.sheets({version: "v4", auth: await googleAuthClient});
  const getRows = await sheetsGet(sheets, googleAuth, spreadsheetId, "Sheet1!A:B");
  const data = JSON.stringify(getRows.data);
  console.log(`Data response: ${data}`);

  res.send(data);
});

routePurchaseOrder.post(
  "/",
  async (req: any, res: { send: (arg0: string) => void; }) => {
    console.log("Purchase Order | Append row");
    console.log(`RequestBody: ${JSON.stringify(req.body)}`);

    const payload = req.body.payload;
    const sheets = google.sheets({version: "v4", auth: await googleAuthClient});

    try {
      let lastId = 0;
      const rawLastId = await getRawLastId(
        sheets,
        googleAuth,
        spreadsheetId,
        "Sheet1!B1"
      );

      if (rawLastId >= 0) {
        lastId = rawLastId + 1;
      }

      const rawDate = new Date();
      const day = rawDate.getDate();
      const month = (rawDate.getMonth()+1);
      const year = rawDate.getFullYear();
      const date = `${day}/${(month)}/${year}`;

      const rows: any[][] = [];
      payload.products.forEach((product: any) => {
        rows.push([
          lastId,
          date,
          payload.observations,
          payload.supplierName,
          product.productName,
          product.productQuantity,
          product.chapterName
        ]);
      });

      await sheetsAppend(sheets, googleAuth, spreadsheetId, "Sheet1!A3:G", rows);
      await updateLastId(sheets, googleAuth, spreadsheetId, "Sheet1!B1", lastId);

      res.send("Puchase order append success!");
    } catch (error) {
      res.send("Puchase order append error!");
      console.log(error);
    }
  });
