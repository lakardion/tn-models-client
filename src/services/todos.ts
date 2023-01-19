import { createApi, parseResponse } from "@thinknimble/tn-models";
import axios from "axios";
import { z } from "zod";

const todoCreateZod = z.object({
  completed: z.boolean().default(false),
  content: z.string().min(1),
});

const todoEntityZod = z
  .object({
    id: z.number(),
  })
  .merge(todoCreateZod);

const client = axios.create({
  baseURL: "http://localhost:3000",
});
const endpoint = "todos";

export const todoApi = createApi(
  {
    client,
    endpoint,
    models: {
      create: todoCreateZod,
      entity: todoEntityZod,
      update: todoCreateZod.partial(),
    },
  },
  {
    /**
     * need to declare another list since we don't have pagination in json-server
     */
    list: async () => {
      const todos = await client.get("todos");
      const result = parseResponse({
        data: todos.data,
        uri: "todos",
        zod: z.array(todoEntityZod),
      });
      return result;
    },
    delete: async (id: number) => {
      return client.delete(`${endpoint}/${id}`);
    },
  }
);
