import {HEADER_KEYS} from "../../../util/network_util";
import {
  getAllOrderPurchase,
  getByRangeOrderPurchase,
  appendOrderPurchase,
  deleteOrderPurchase,
  approveOrderPurchase,
} from "./order_purchase_controller";

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
route.get("/", async (req: any, res: any) => {
  try {
    const spreadsheetId = req.get(HEADER_KEYS.spreadsheetId);
    const response = await getAllOrderPurchase(spreadsheetId);
    res.status(200).send(response);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

/**
 * Get by range
 * Developed by Juan Ortiz
 */
route.get("/range", async (req: any, res: any) => {
  try {
    const spreadsheetId = req.get(HEADER_KEYS.spreadsheetId);
    const startPosition = req.query.start;
    const endPosition = req.query.end;

    if (startPosition !== undefined && endPosition !== undefined) {
      const response = await getByRangeOrderPurchase(
        spreadsheetId,
        startPosition,
        endPosition
      );
      res.status(200).send(response);
    } else {
      throw Error("No startPosition or endPosition found!");
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
      console.log("Purchase Order | Append row");
      console.log(`RequestBody: ${JSON.stringify(req.body)}`);

      const spreadsheetId = req.get(HEADER_KEYS.spreadsheetId);
      const payload = req.body.data;

      const response = await appendOrderPurchase(spreadsheetId, payload);
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
  "/update",
  async (req: any, res: any) => {
    try {
      const spreadsheetId = req.get(HEADER_KEYS.spreadsheetId);
      const payload = req.body.data;

      deleteOrderPurchase(
        spreadsheetId,
        payload.startPosition,
        payload.endPosition
      );

      const response = await appendOrderPurchase(
        spreadsheetId,
        payload.orderPurchase
      );

      res.status(200).send(response);
    } catch (error) {
      console.log(error);
      res.status(500).send();
    }
  }
);

/**
 * Approve
 * Developed by Juan Ortiz
 */
route.post(
  "/approve",
  async (req: any, res: any) => {
    try {
      const spreadsheetId = req.get(HEADER_KEYS.spreadsheetId);
      const payload = req.body.data;
      const response = await approveOrderPurchase(spreadsheetId, payload);
      res.status(200).send(response);
    } catch (error) {
      console.log(error);
      res.status(500).send();
    }
  }
);
