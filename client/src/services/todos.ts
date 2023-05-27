import {
  createApi,
  createCustomServiceCall,
  readonly,
} from "@thinknimble/tn-models-fp";
import axios from "axios";
import { z } from "zod";

const entityZodRaw = {
  completed: z.boolean().default(false),
  content: z.string().min(1),
  completedDate: readonly(z.string().datetime().nullable()),
  id: z.number(),
};

const client = axios.create({
  baseURL: "http://localhost:3000",
});
const endpoint = "todos";

export const todoApi = createApi({
  client,
  baseUri: endpoint,
  models: {
    entity: entityZodRaw,
  },
});
