import { Elysia, t } from "elysia";
import { auth } from "../../auth";
import { db } from "../../database";
import { user } from "../../schema";
import { eq} from "drizzle-orm";
export const loginRoute = new Elysia()

loginRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).post(
  '/api/login',
  async ({ body: { email, password } }) => {
    const data = await auth.api.signInEmail({
      body: { email, password },
      asResponse: true,
    });
    const fetchedUsers = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);

    const currentUser = fetchedUsers[0];
    if (!currentUser) {
      return new Response('User not found', { status: 404 });
    }

    return data;
  },
  {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  },
);