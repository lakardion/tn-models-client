import { RequestHandler } from "express";
import { z, ZodError } from "zod";
import {
  createZod,
  entityZod,
  InMemoryDB,
  updateZod,
} from "../utils/in-memory-db.js";

const inMemoryDb = new InMemoryDB();

const paginationQueryFiltersZod = z
  .object({
    page: z.string().optional(),
    page_size: z.string().optional(),
  })
  .optional();

type PaginationQueryFilters = z.infer<typeof paginationQueryFiltersZod>;

export const getTodos: RequestHandler = (req, res) => {
  const query = req.query;
  let parsedQuery: PaginationQueryFilters;
  try {
    parsedQuery = paginationQueryFiltersZod.parse(query);
  } catch (err) {
    const zodErr = err as ZodError<PaginationQueryFilters>;
    res.status(400).json({
      message: "Your input was invalid",
      errors: zodErr.errors,
    });
  }
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
  let parsed: z.infer<typeof createZod>;
  try {
    parsed = createZod.parse(body);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "The todo format is not valid",
    });
    return;
  }
  const created = inMemoryDb.add(parsed);
  res.status(201).json(created);
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

export const updateTodo: RequestHandler = (req, res) => {
  const { params, body } = req;
  if (!("todoId" in params)) {
    res.status(400).json({
      message: "You did not provide a todoId in the url",
    });
    return;
  }
  let parsed: z.infer<typeof createZod>;
  try {
    parsed = createZod.parse(body);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "The todo format is not valid",
    });
    return;
  }
  const updated = inMemoryDb.update({ ...parsed, id: parseInt(params.todoId) });
  if (updated === null) {
    res.status(404).json({
      message: "No todo found with this id",
    });
    return;
  }
  res.status(200).json(updated);
};

export const patchTodo: RequestHandler = (req, res) => {
  const { params, body } = req;
  if (!("todoId" in params)) {
    res.status(400).json({
      message: "You did not provide a todoId in the url",
    });
    return;
  }
  let parsed: z.infer<typeof updateZod>;
  try {
    parsed = updateZod.parse(body);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "The todo format is not valid",
    });
    return;
  }
  const updated = inMemoryDb.update({ ...parsed, id: parseInt(params.todoId) });
  if (updated === null) {
    res.status(404).json({
      message: "No todo found with this id",
    });
    return;
  }
  res.status(200).json(updated);
};
