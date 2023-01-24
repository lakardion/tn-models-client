import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  getTodo,
  getTodos,
} from "../controllers/todos.js";

export const todosRouter = Router();

todosRouter.get("/", getTodos);
todosRouter.get("/:todoId", getTodo);
todosRouter.post("/", createTodo);
todosRouter.delete("/:todoId", deleteTodo);
