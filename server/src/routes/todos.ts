import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  getTodo,
  getTodos,
  patchTodo,
  updateTodo,
} from "../controllers/todos.js";

export const todosRouter = Router();

todosRouter.post("/", createTodo);
todosRouter.get("/", getTodos);
todosRouter.get("/:todoId", getTodo);
todosRouter.put("/:todoId", updateTodo);
todosRouter.patch("/:todoId", patchTodo);
todosRouter.delete("/:todoId", deleteTodo);
