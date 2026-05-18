import { Elysia, t } from "elysia";
import { db } from "../../database";
import { conversation, conversationInsertSchema } from "../../schema";
export const conversationRoute = new Elysia()

conversationRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).post(
  '/conversation',
  async ({ body }) => {
    const data = await db.insert(conversation).values(body);
    return body;
  },
  {
    body: t.Omit(conversationInsertSchema, ['id']),
  },
);