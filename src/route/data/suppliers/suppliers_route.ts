import {HEADER_KEYS} from "../../../util/network_util";
import {
  getAll,
  getByRange,
  append,
  update,
  updateAccountingDocument,
} from "./suppliers_controller";

import express = require("express");

/**
 * Clients Route
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
      console.log("Suppliers | Get all");
      const response = await getAll();

      res.status(200).send(response);
    } catch (error) {
      console.log(error);
      res.status(500).send();
    }
  }
);

/**
 * Get by range | Suppliers
 * Developed by Juan Ortiz
 */
route.get("/range", async (req: any, res: any) => {
  try {
    const position = req.query.position;

    if (position !== undefined) {
      const response = await getByRange(position);
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
 * Append Supplier
 * Developed by Juan Ortiz
 */
route.put(
  "/",
  async (req: any, res: any) => {
    try {
      console.log("Suppliers | Append row");
      console.log(`RequestBody: ${JSON.stringify(req.body)}`);
      const payload = req.body.data;

      const response = await append(payload);

      res.status(200).send(response);
    } catch (error) {
      console.log(error);
      res.status(500).send();
    }
  }
);

/**
 * Update Supplier
 * Developed by Juan Ortiz
 */
route.post(
  "/",
  async (req: any, res: any) => {
    try {
      console.log("Suppliers | Update");
      console.log(`RequestBody: ${JSON.stringify(req.body)}`);
      const payload = req.body.data;

      const response = await update( payload);

      res.status(200).send(response);
    } catch (error) {
      console.log(error);
      res.status(500).send();
    }
  }
);

/**
 * Add accounting support | Suppliers
 * Developed by Juan Ortiz
 */
route.post(
  "/accountingdocument",
  async (req: any, res: any) => {
    try {
      console.log("Suppliers | Accounting Document");
      console.log(`RequestBody: ${JSON.stringify(req.body)}`);

      const spreadsheetId = req.get(HEADER_KEYS.spreadsheetId);
      const payload = req.body.data;

      const response = await updateAccountingDocument(
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
