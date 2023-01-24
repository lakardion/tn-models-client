import { Router } from "express";
import { createTodo, deleteTodo, getTodos } from "../controllers/todos.js";

export const todosRouter = Router();

todosRouter.get("/", getTodos);
todosRouter.post("/", createTodo);
todosRouter.delete("/:todoId", deleteTodo);
