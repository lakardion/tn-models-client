import { RequestHandler } from "express";

export const getTodos: RequestHandler = (req, res) => {
  //TODO: get all todos from in-memory
  res.status(200).json({
    message: "WIP",
  });
};

export const createTodo: RequestHandler = (req, res) => {
  //TODO: add zod validation, create in-memory todo from req body and return it.
  res.status(200).json({
    message: "WIP",
  });
};

export const deleteTodo: RequestHandler = (req, res) => {
  //TODO: add zod validation, delete in-memory todo getting id from url param
  res.status(200).json({
    message: "WIP",
  });
};
