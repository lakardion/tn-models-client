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
  completedDate: z.string().datetime().nullable(),
};

const partialUpdateZodRaw = {
  id: z.number(),
  completed: z.boolean().optional(),
  content: z.string().min(1).optional(),
  completedDate: z.string().datetime().nullable().optional(),
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
const updatePartial = createCustomServiceCall(
  {
    inputShape: partialUpdateZodRaw,
    outputShape: entityZodRaw,
  },
  async ({ client, endpoint, input, utils: { toApi, fromApi } }) => {
    const { id, ...rest } = toApi(input);
    const res = await client.patch(`${endpoint}/${id}`, rest);
    return fromApi(res.data);
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
    updatePartial,
  }
);
