import {HEADER_KEYS} from "../../util/network_util";
import {
  getAll,
  getByRange,
  append,
  update,
  updateAccountingDocument,
} from "./clients_controller";
import {
  appendHousehold,
  updateHousehold,
  deleteHousehold
} from "./households/households_controller";
import {
  appendPayment,
  updatePayment,
} from "./payments/payments_controller";

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
      console.log("Clients | Get all");
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
      console.log("Clients | Append row");
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
      console.log("Clients | Update");
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
 * Delete
 * Developed by Juan Ortiz
 */
route.delete(
  "/",
  async (req: any, res: any) => {
    try {
      console.log("Clients | Update");
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
route.post(
  "/accountingdocument",
  async (req: any, res: any) => {
    try {
      console.log("Clients | Accounting Document");
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

/**
 * Append household
 * Developed by Juan Ortiz
 */
route.put(
  "/households/",
  async (req: any, res: any) => {
    try {
      console.log("Households clients | Append row");
      console.log(`RequestBody: ${JSON.stringify(req.body)}`);

      const spreadsheetId = req.get(HEADER_KEYS.spreadsheetId);
      const payload = req.body.data;

      const response = await appendHousehold(
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
  "/households/",
  async (req: any, res: any) => {
    try {
      console.log("Clients households | Update");
      console.log(`RequestBody: ${JSON.stringify(req.body)}`);

      const spreadsheetId = req.get(HEADER_KEYS.spreadsheetId);
      const payload = req.body.data;

      const response = await updateHousehold(
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
 * Delete Household
 * Developed by Juan Ortiz
 */
route.delete(
  "/households/",
  async (req: any, res: any) => {
    try {
      console.log("Clients households | Delete");
      console.log(`RequestBody: ${JSON.stringify(req.body)}`);

      const spreadsheetId = req.get(HEADER_KEYS.spreadsheetId);
      const payload = req.body.data;

      const response = await deleteHousehold(
        spreadsheetId,
        payload,
      );

      res.status(200).send(response);
    } catch (error) {
      console.log(error);
      res.status(500).send();
    }
  }
);


/**
 * Append household
 * Developed by Juan Ortiz
 */
route.put(
  "/payments/",
  async (req: any, res: any) => {
    try {
      console.log("Payments clients | Append row");
      console.log(`RequestBody: ${JSON.stringify(req.body)}`);

      const spreadsheetId = req.get(HEADER_KEYS.spreadsheetId);
      const payload = req.body.data;

      const response = await appendPayment(
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
  "/payments/",
  async (req: any, res: any) => {
    try {
      console.log("Payments clients | Update");
      console.log(`RequestBody: ${JSON.stringify(req.body)}`);

      const spreadsheetId = req.get(HEADER_KEYS.spreadsheetId);
      const payload = req.body.data;

      const response = await updatePayment(
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
