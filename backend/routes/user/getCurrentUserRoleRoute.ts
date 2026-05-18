
import { Elysia, t } from "elysia";
import { auth } from "../../auth";
import { db } from "../../database";
import { eq } from "drizzle-orm";
import { user } from "../../schema";
export const getCurrentUserRoleRoute = new Elysia()

getCurrentUserRoleRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).get('/api/current-user-role', async ({ headers }) => {
  const session = await auth.api.getSession({ headers });
  if (!session) {
    throw new Response('Not authenticated', { status: 401 });
  }
  return (await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1))[0]?.role ?? null;
  // return session;
});