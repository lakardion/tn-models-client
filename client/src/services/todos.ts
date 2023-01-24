import { createApi, parseResponse } from "@thinknimble/tn-models";
import axios from "axios";
import { z } from "zod";

const createZodRaw = {
  completed: z.boolean().default(false),
  content: z.string().min(1),
};

const entityZodRaw = { ...createZodRaw, id: z.number() };

const client = axios.create({
  baseURL: "http://localhost:3000",
});
const endpoint = "todos";

export const todoApi = createApi(
  {
    client,
    endpoint,
    models: {
      create: createZodRaw,
      entity: entityZodRaw,
      update: createZodRaw,
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
        zod: z.array(z.object(entityZodRaw)),
      });
      return result;
    },
    delete: async (id: number) => {
      return client.delete(`${endpoint}/${id}`);
    },
  }
);
