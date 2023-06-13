import * as functions from "firebase-functions";
import * as express from "express";
import bodyParser = require("body-parser");
import {routeChapters} from "./route/data/data_chapters";
import {routePurchaseOrder} from "./route/purchase/order/purchase_order";
import {route as projectRoute} from "./route/project/project";

const api = express();

api.use(bodyParser.json());
api.use(bodyParser.urlencoded({extended: true}));

api.get("/", async (req, res) => {
  res.send("Not implemented!");
});

api.use("/project", projectRoute);
api.use("/data/chapters", routeChapters);
api.use("/purchase/order", routePurchaseOrder);

exports.api = functions.https.onRequest(api);
