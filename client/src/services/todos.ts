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
    delete: createCustomServiceCall({
      inputShape: z.number(),
      outputShape: {
        nothing: z.any(),
      },
      callback: async ({ client, input, utils }) => {
        await client.delete(`todos/${input}`);
        return {
          nothing: "faulty api bro",
        };
      },
    }),
  }
);
