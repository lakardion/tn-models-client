import bodyParser from "body-parser";
import express, { RequestHandler } from "express";
import { todosRouter } from "./src/routes/todos.js";

const app = express();
const port = 3000;

const corsMiddleware: RequestHandler = (req, res, next) => {
  // ! we could lock this to certain domains only
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
};
app.use(corsMiddleware);
app.use(bodyParser.json());

app.use("/todos", todosRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
