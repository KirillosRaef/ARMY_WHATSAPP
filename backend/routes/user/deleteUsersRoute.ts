import { Elysia, t } from "elysia";
import { db } from "../../database";
import { user } from "../../schema";
import { and, inArray, ne } from "drizzle-orm";
import { lower } from "../..";
export const deleteUsersRoute = new Elysia()

deleteUsersRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).delete('/api/users', async ({ body: { userIds } }) => {
  const data = await db.delete(user)
    .where(and(inArray(user.id, userIds), ne(lower(user.name), 'mnozom')));
  return { success: true, data };
}, {
  body: t.Object({
    userIds: t.Array(t.String()),
  }),
});