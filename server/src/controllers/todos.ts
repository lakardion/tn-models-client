import { RequestHandler } from "express";
import { z } from "zod";
import { createZod, entityZod, InMemoryDB } from "../utils/in-memory-db.js";

const inMemoryDb = new InMemoryDB();

const paginationQueryFiltersZod = z
  .object({
    page: z.string().optional(),
    page_size: z.string().optional(),
  })
  .optional();

export const getTodos: RequestHandler = (req, res) => {
  const query = req.query;
  const parsedQuery = paginationQueryFiltersZod.parse(query);
  const page = parseInt(parsedQuery?.page ?? "1");
  if (page !== 1 && page > inMemoryDb.maxPages) {
    res.status(404).json({
      message: "That page does not exist",
    });
    return;
  }
  res.status(200).json(inMemoryDb.getTodos(parsedQuery));
};

export const getTodo: RequestHandler = (req, res) => {
  const params = req.params;
  if (!("todoId" in params)) {
    res.status(400).json({
      message: "No todoId provided",
    });
    return;
  }
  const todoId = parseInt(params.todoId);
  if (isNaN(todoId))
    return res.status(400).json({ message: "Invalid id provided" });
  const foundTodo = inMemoryDb.getSingle(todoId);
  if (!foundTodo) {
    return res.status(404).json({
      message: "Inexistent todo",
    });
  }
  res.status(200).json(foundTodo);
};

export const createTodo: RequestHandler = (req, res) => {
  const body = req.body;
  try {
    const parsed = createZod.parse(body);
    const created = inMemoryDb.add(parsed);
    res.status(201).json(created);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "The todo format is not valid",
    });
  }
};

export const deleteTodo: RequestHandler = (req, res) => {
  const param = req.params;
  if (!("todoId" in param)) {
    res.status(400).json({
      message: "You did not provide a todoId in the url",
    });
    return;
  }
  inMemoryDb.remove(parseInt(param.todoId));
  res.status(200).send();
};
