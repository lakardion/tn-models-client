import { createApi } from "@thinknimble/tn-models";
import axios from "axios";
import { z } from "zod";

const todoCreateZod = z.object({
  completed: z.boolean().default(false),
  content: z.string().min(1),
});

const todoEntityZod = z
  .object({
    id: z.string().uuid(),
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
    list: async () => {
      return 10;
    },
  }
);
