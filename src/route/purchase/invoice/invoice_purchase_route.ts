import {HEADER_KEYS} from "../../../util/network_util";
import {
  append, 
  update, 
  addAccountingSupport,
  getAll,
  getByRange,
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
 * Get all
 * Developed by Juan Ortiz
 */
route.get(
  "/",
  async (req: any, res: any) => {
    try {
      console.log("Purchase Invoice | Get all");
      console.log(`RequestBody: ${JSON.stringify(req.body)}`);

      const spreadsheetId = req.get(HEADER_KEYS.spreadsheetId);

      const response = await getAll(
        spreadsheetId
      );

      res.status(200).send(response);
    } catch (error) {
      console.log(error);
      res.status(500).send();
    }
  }
);

/**
 * Get by range
 * Developed by Juan Ortiz
 */
route.get("/range", async (req: any, res: any) => {
  try {
    const spreadsheetId = req.get(HEADER_KEYS.spreadsheetId);
    const position = req.query.position;

    if (position !== undefined) {
      const response = await getByRange(
        spreadsheetId,
        position
      );
      res.status(200).send(response);
    } else {
      throw Error("No position found!");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
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

/**
 * Add accounting support
 * Developed by Juan Ortiz
 */
route.put(
  "/accountingsupport",
  async (req: any, res: any) => {
    try {
      console.log("Purchase Invoice | Append row");
      console.log(`RequestBody: ${JSON.stringify(req.body)}`);

      const spreadsheetId = req.get(HEADER_KEYS.spreadsheetId);
      const payload = req.body.data;

      const response = await addAccountingSupport(
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
