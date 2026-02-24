import { Elysia, t } from "elysia";
import { createInsertDevice, createInsertDeviceType, createInsertRequests, device, deviceType, profile, requests, user } from "./schema";
import { db } from "./database";
import { auth } from "./auth";
import { eq } from "drizzle-orm";

const app = new Elysia();



// Add a new user
app
  .onError((e) => {
    console.log(e);
  })
  .group('api', (app) => app.post(
    '/signup',
    async ({ body: { name, email, password, role } }) => {
      const data = await auth.api.signUpEmail({
        body: {
          name: name, // required
          email: email, // required
          password: password, // required
        },
      });
      await db.insert(profile).values({
        id: data.user.id,
        role: role as "admin" | "user",
      });
      return { name, email };
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
        role: t.String({ enum: ['admin', 'user'] }),
      }),
    },
  )
    .post('/login', async ({ body: { email, password } }) => {
      const data = await auth.api.signInEmail({
        body: { email, password },
        asResponse: true,
      });
      return data;
    }, {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    })
    .post(
      '/device-type',
      async ({ body }) => {
        const data = await db.insert(deviceType).values(body);
        return body;
      },
      {
        body: t.Omit(createInsertDeviceType, ['id']),
      },
    )
    .post(
      '/device',
      async ({ body }) => {
        const data = await db.insert(device).values(body);
        return body;
      },
      {
        body: t.Omit(createInsertDevice, ['id']),
      },
    )
    .post(
      '/requests',
      async ({ body }) => {
        const data = await db.insert(requests).values(body);
        return body;
      },
      {
        body: t.Omit(createInsertRequests, ['id']),
      },
    )
    .delete('/device-type/:id', async ({ params: { id } }) => {
      const data = await db.delete(deviceType).where(eq(deviceType.id, id));
    })
    .delete('/device/:id', async ({ params: { id } }) => {
      const data = await db.delete(device).where(eq(device.id, id));
    })
    .delete('/requests/:id', async ({ params: { id } }) => {
      const data = await db.delete(requests).where(eq(requests.id, id));
    })
    .get('/users', () => {
      return db.select().from(user);
    })
    .get(
      '/profile/:id',
      async ({ params }) => {
        const result = await db
          .select({ role: profile.role })
          .from(profile)
          .where(eq(profile.id, params.id))
          .limit(1)

        if (!result.length) {
          return new Response('Profile not found', { status: 404 })
        }

        return { role: result[0]!.role }
      },
      {
        params: t.Object({
          id: t.String(),
        }),
      }
    ));

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

