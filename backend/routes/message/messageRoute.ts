import { Elysia, t } from "elysia";
import { db } from "../../database";
import { message, messageInsertSchema } from "../../schema";
export const messageRoute = new Elysia()

messageRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).post(
  '/message',
  async ({ body }) => {
    const data = await db.insert(message).values(body);
    return body;
  },
  {
    body: t.Omit(messageInsertSchema, ['id']),
  },
);