import { HEADER_KEYS } from "../../../util/network_util";
import {
  append, update,
} from "./invoice_purchase_controller";

import express = require("express");

/**
 * Projects Route
 * Developed by Juan Ortiz
 */
export const route = express.Router();

route.use((_req: any, _res: any, next: () => void) => {
  next();
});

/**
 * Append
 * Developed by Juan Ortiz
 */
route.put(
  "/",
  async (req: any, res: any) => {
    try {
      console.log("Purchase Invoice | Append row");
      console.log(`RequestBody: ${JSON.stringify(req.body)}`);

      const spreadsheetId = req.get(HEADER_KEYS.spreadsheetId);
      const payload = req.body.data;

      const response = await append(
        spreadsheetId,
        payload
      );

      res.status(200).send(response);
    } catch (error) {
      console.log(error);
      res.status(500).send();
    }
  }
);

/**
 * Update
 * Developed by Juan Ortiz
 */
route.post(
  "/",
  async (req: any, res: any) => {
    try {
      console.log("Purchase Invoice | Append row");
      console.log(`RequestBody: ${JSON.stringify(req.body)}`);

      const spreadsheetId = req.get(HEADER_KEYS.spreadsheetId);
      const payload = req.body.data;

      const response = await update(
        spreadsheetId,
        payload
      );

      res.status(200).send(response);
    } catch (error) {
      console.log(error);
      res.status(500).send();
    }
  }
);
