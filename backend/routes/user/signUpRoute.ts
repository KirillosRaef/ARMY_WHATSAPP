import { Elysia, t } from "elysia";
import { auth } from "../../auth";

export const signUpRoute = new Elysia()

signUpRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).post('/api/signup',
  async ({ body: { name, email, password, role, number } }) => {
    const data = await auth.api.signUpEmail({
      body: {
        name: name, // required
        email: email, // required
        password: password, // required
        role: role,
        number: number,
      },
    });
    return { name, email };
  },
  {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String(),
      role: t.Union([
        t.Literal('Admin'),
        t.Literal('User'),
      ]),
      number: t.String(),
    }),
  },
);