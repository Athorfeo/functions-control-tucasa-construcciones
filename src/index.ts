import * as functions from "firebase-functions";
import * as express from "express";
import * as cors from "cors";
import bodyParser = require("body-parser");
import {routeChapters} from "./route/data/data_chapters";
import {route as suppliersRoute} from "./route/data/suppliers";
import {
  route as orderPurchaseRoute,
} from "./route/purchase/order/order_purchase_route";
import {route as projectRoute} from "./route/project/project";
import {route as userRoute} from "./route/user/user";
import {
  route as minuteServiceRoute,
} from "./route/service/minute/minute_service_route";

const api = express();

api.use(cors({origin: true}));
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({extended: true}));

api.get("/", async (req, res) => {
  res.send("Not implemented!");
});

api.use("/data/chapters", routeChapters);
api.use("/data/suppliers", suppliersRoute);
api.use("/project", projectRoute);
api.use("/user", userRoute);
api.use("/purchase/order", orderPurchaseRoute);
api.use("/service/minute", minuteServiceRoute);

exports.api = functions.https.onRequest(api);
