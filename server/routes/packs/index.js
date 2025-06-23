import express from "express";
import crudRoutes from "./crud.js";
import combinationRoutes from "./combinations.js";
import openingRoutes from "./opening.js";

const router = express.Router();

export default (db, middleware) => {
  // Mount all pack route handlers
  router.use("/", crudRoutes(db, middleware));
  router.use("/", combinationRoutes(db, middleware));
  router.use("/", openingRoutes(db, middleware));

  return router;
};
