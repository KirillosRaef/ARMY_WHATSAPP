import { Elysia, t } from "elysia";
import { createInsertDevice, createInsertDeviceType, createInsertRequest, device, deviceType, profile, request, user } from "./schema";
import { db } from "./database";
import { auth } from "./auth";
import { eq, and } from "drizzle-orm";
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { imageRoutes } from "./routes/imageRoutes";

const app = new Elysia()
  .use(cors({
    origin: 'http://localhost:5173',
  }))
  .use(staticPlugin({
    assets: 'images',
    prefix: '/images',
  })).use(imageRoutes);



app
  .onError((e) => {
    console.log(e);
  })
  .group('api', (app) =>
    app
      .post(
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
            role: role as 'admin' | 'user',
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
      .post(
        '/login',
        async ({ body: { email, password } }) => {
          const data = await auth.api.signInEmail({
            body: { email, password },
            //asResponse: true,
          });
          const role = await db
            .select({ role: profile.role })
            .from(profile)
            .where(eq(profile.id, data.user.id))
            .limit(1);
          // return { ...data, role: role[0]?.role || 'user' };
          return { ...data, role: role[0]?.role || 'user' };
        },
        {
          body: t.Object({
            email: t.String(),
            password: t.String(),
          }),
        },
      )
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
        '/request',
        async ({ body }) => {
          const data = await db.insert(request).values(body);
          return body;
        },
        {
          body: t.Omit(createInsertRequest, ['id']),
        },
      )
      .post(
        '/device-type-id',
        async ({ body: { brandName, deviceKind, description } }) => {
          const result = await db
            .select({ id: deviceType.id })
            .from(deviceType)
            .where(
              and(
                eq(deviceType.brandName, brandName),
                eq(deviceType.deviceKind, deviceKind),
                eq(deviceType.description, description),
              ),
            )
            .limit(1);

          return { id: result[0]?.id ?? null };
        },
        {
          body: t.Object({
            brandName: t.String(),
            deviceKind: t.String(),
            description: t.String(),
          }),
        },
      )
      .delete('/device-type/:id', async ({ params: { id } }) => {
        const data = await db.delete(deviceType).where(eq(deviceType.id, id));
      })
      .delete('/device/:id', async ({ params: { id } }) => {
        const data = await db.delete(device).where(eq(device.id, id));
      })
      .delete('/request/:id', async ({ params: { id } }) => {
        const data = await db.delete(request).where(eq(request.id, id));
      })
      .get('/users', () => {
        return db.select().from(user);
      })
      .get('/device-types', () => {
        return db.select().from(deviceType);
      })
      .get('/devices', () => {
        return db.select().from(device);
      })
      .get('/requests', () => {
        return db.select().from(request);
      })
      .get('/requests/:userId', async ({ params: { userId } }) => {
        return db.select().from(request).where(eq(request.userId, userId));
      })
      //TODO: useless api, could be useful later
      .get('/role/:id', async ({ params: { id } }) => {
        return await db
          .select({ role: profile.role })
          .from(profile)
          .where(eq(profile.id, id))
          .limit(1);
      })
      .get(
        '/profile/:id',
        async ({ params }) => {
          const result = await db
            .select({ role: profile.role })
            .from(profile)
            .where(eq(profile.id, params.id))
            .limit(1);

          if (!result.length) {
            return new Response('Profile not found', { status: 404 });
          }

          return { role: result[0]!.role };
        },
        {
          params: t.Object({
            id: t.String(),
          }),
        },
      ),
      
  );

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

