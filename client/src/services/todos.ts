import {
  createApi,
  createCustomServiceCall,
  parseResponse,
} from "@thinknimble/tn-models";
import axios from "axios";
import { z } from "zod";

const createZodRaw = {
  completed: z.boolean().default(false),
  content: z.string().min(1),
  completedDate: z.string().datetime(),
};

const entityZodRaw = { ...createZodRaw, id: z.number() };

const client = axios.create({
  baseURL: "http://localhost:3000",
});
const endpoint = "todos";

const deleteTodo = createCustomServiceCall(
  {
    inputShape: z.number(),
  },
  async ({ input, client, endpoint }) => {
    await client.delete(`${endpoint}/${input}`);
  }
);

export const todoApi = createApi(
  {
    client,
    endpoint,
    models: {
      create: createZodRaw,
      entity: entityZodRaw,
    },
  },
  {
    deleteTodo,
  }
);
