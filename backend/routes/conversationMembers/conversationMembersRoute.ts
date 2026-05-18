import { Elysia, t } from "elysia";
import { db } from "../../database";
import { conversationMembers, conversationMembersInsertSchema } from "../../schema";
export const conversationMembersRoute = new Elysia()

conversationMembersRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).post(
  '/conversation-members',
  async ({ body }) => {
    const data = await db.insert(conversationMembers).values(body);
    return body;
  },
  {
    body: t.Omit(conversationMembersInsertSchema, ['id']),
  },
);