import * as functions from "firebase-functions";
import * as express from "express";
import * as cors from "cors";
import bodyParser = require("body-parser");
import {routeChapters} from "./route/data/data_chapters";
import {route as suppliersRoute} from "./route/data/suppliers";
import {route as contractorsRoute} from "./route/data/contractors";
import {
  route as orderPurchaseRoute,
} from "./route/purchase/order/order_purchase_route";
import {
  route as invoicePurchaseRoute,
} from "./route/purchase/invoice/invoice_purchase_route";
import {route as projectRoute} from "./route/project/project";
import {route as userRoute} from "./route/user/user";
import {
  route as minuteServiceRoute,
} from "./route/service/minute/minute_service_route";
import {
  route as pettycashPurchaseRoute,
} from "./route/purchase/pettycash/pettycash_purchase_route";
import {
  route as clientsRoute,
} from "./route/clients/clients_route";

const api = express();

api.use(cors({origin: true}));
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({extended: true}));

api.get("/", async (req, res) => {
  res.send("Not implemented!");
});

api.use("/data/chapters", routeChapters);
api.use("/data/suppliers", suppliersRoute);
api.use("/data/contractors", contractorsRoute);
api.use("/project", projectRoute);
api.use("/user", userRoute);
api.use("/purchase/order", orderPurchaseRoute);
api.use("/purchase/invoice", invoicePurchaseRoute);
api.use("/purchase/pettycash", pettycashPurchaseRoute);
api.use("/service/minute", minuteServiceRoute);
api.use("/clients", clientsRoute);

exports.api = functions.https.onRequest(api);
