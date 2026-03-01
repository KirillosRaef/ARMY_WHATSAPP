import { Elysia, t } from "elysia";
import { createInsertDevice, createInsertDeviceType, createInsertRequest, device, deviceType, militaryUnit, profile, request, user } from "./schema";
import { db } from "./database";
import { auth } from "./auth";
import { eq, and, sql, inArray, ne } from "drizzle-orm";
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { imageRoutes } from "./routes/imageRoutes";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { acceptRequestsRoute } from "./routes/acceptRequestsRoute";
import { devicesWithDescriptionRoute } from "./routes/devicesWithDescriptionRoute";
import { militaryUnitRoutes } from "./routes/militaryUnitRoutes";

export function lower(email: SQLiteColumn): any {
  return sql`lower(${email})`;
}

const app = new Elysia()
  .use(cors({
    origin: 'http://localhost:5173',
  }))
  .use(staticPlugin({
    assets: 'images',
    prefix: '/images',
  }))
  .use(imageRoutes)
  .use(acceptRequestsRoute)
  .use(devicesWithDescriptionRoute)
  .use(militaryUnitRoutes);



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
            role: role as 'Admin' | 'User',
          });
          return { name, email };
        },
        {
          body: t.Object({
            name: t.String(),
            email: t.String(),
            password: t.String(),
            role: t.String({ enum: ['Admin', 'User'] }),
          }),
        },
      )
      .post(
        '/login',
        async ({ body: { email, password } }) => {
          const data = await auth.api.signInEmail({
            body: { email, password },
            asResponse: true,
          });
          const fetchedUsers = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);

          const currentUser = fetchedUsers[0];
          if(!currentUser) {
            return new Response('User not found', { status: 404 });
          }

          const role = await db
            .select({ role: profile.role })
            .from(profile)
            .where(eq(profile.id, currentUser.id))
            .limit(1);
          return data;
        },
        {
          body: t.Object({
            email: t.String(),
            password: t.String(),
          }),
        },
    )
      .get('/role', async ({ headers}) => {
        const session = await auth.api.getSession({ headers});
        if (!session) {
          throw new Response('Not authenticated', { status: 401 });
        }
        return (await db
            .select({ role: profile.role })
            .from(profile)
            .where(eq(profile.id, session.user.id))
            .limit(1))[0]?.role ?? null;
          // return session;
      })
      .get('/user-id', async ({ headers}) => {
        const session = await auth.api.getSession({ headers});
        if (!session) {
          throw new Response('Not authenticated', { status: 401 });
        }
        const userId = session.user.id;
        // console.log('User ID: ', userId);
        return userId;
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
          const data = await db.select().from(device).where(eq(device.serialNumber, body.serialNumber));
          if (data.length > 0) {
            throw new Error('Serial number already exists');
          }
          await db.insert(device).values(body);
          return body;
        },
        {
          body: t.Omit(createInsertDevice, ['id']),
        },
      )
      .post(
        '/request',
        async ({ body }) => {
          const data = await db.select().from(request).where(eq(request.serialNumber, body.serialNumber));
          if (data.length > 0) {
            throw new Error('Serial number already exists');
          }
          await db.insert(request).values(body);
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
      .delete('/request', async () => {
        return await db.delete(request);
      })
      .delete('/device-types', async () => {
        return await db.delete(deviceType);
      })
      .delete('/device', async () => {
        return await db.delete(device);
      })
      .delete(
        '/requests',
        async ({ body: { requestIds } }) => {
          return await db.delete(request).where(inArray(request.id, requestIds));
        },
        {
          body: t.Object({
            requestIds: t.Array(t.String()),
          }),
        },
      )
      .delete(
        '/device-types',
        async ({ body: { deviceTypeIds } }) => {
          return await db.delete(deviceType).where(inArray(deviceType.id, deviceTypeIds));
        },
        {
          body: t.Object({
            deviceTypeIds: t.Array(t.String()),
          }),
        },
      )
      .delete(
        '/devices',
        async ({ body: { deviceIds } }) => {
          return await db.delete(device).where(inArray(device.id, deviceIds));
        },
        {
          body: t.Object({
            deviceIds: t.Array(t.String()),
          }),
        },
      )
      .delete('/users', async ({ body: { userIds } }) => {
        await db.delete(user)
          .where(and(inArray(user.id, userIds), ne(lower(user.name), 'mnozom')));
        await db.delete(profile)
          .where(
            and(
              inArray(profile.id,userIds),
              db.select()
                .from(profile)
                .innerJoin(user, eq(profile.id, user.id))
                .where(ne(lower(user.name), 'mnozom'))
            )
          );
      }, {
        body: t.Object({
          userIds: t.Array(t.String()),
        }),  
      })
      .get('/users', () => {
        return db.select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: profile.role,
          image: user.image, //TODO: ADD PROFILE IMAGE
        }).from(user).leftJoin(profile, eq(user.id, profile.id));
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
      .get('/requests-with-description', () => {
        return db
          .select({
            id: request.id,
            deviceTypeId: request.deviceTypeId,
            militaryUnitId: request.militaryUnitId,
            serialNumber: request.serialNumber,
            usage: request.usage,
            devicePhoto: request.devicePhoto,
            serialNumberPhoto: request.serialNumberPhoto,
            brandLogo: deviceType.brandLogo,
            username: request.username,
            militaryUnitName: militaryUnit.militaryUnitName,
            branch: militaryUnit.branch,
            deviceDescription:  sql<string>`
              ${deviceType.brandName} || ' ' ||
              ${deviceType.deviceKind} || ' ' ||
              ${deviceType.description}
            `.as('deviceDescription')
          })
          .from(request)
          .leftJoin(deviceType, eq(request.deviceTypeId, deviceType.id))
          .leftJoin(militaryUnit, eq(request.militaryUnitId, militaryUnit.id));
      })
      .get('/requests/:userId', async ({ params: { userId } }) => {
        return db.select().from(request).where(eq(request.userId, userId));
      })
      .get('/requests-with-description/:userId', async ({ params: { userId } }) => {
        return db
          .select({
            id: request.id,
            deviceTypeId: request.deviceTypeId,
            militaryUnitId: request.militaryUnitId,
            serialNumber: request.serialNumber,
            usage: request.usage,
            devicePhoto: request.devicePhoto,
            serialNumberPhoto: request.serialNumberPhoto,
            brandLogo: deviceType.brandLogo,
            username: request.username,
            militaryUnitName: militaryUnit.militaryUnitName,
            branch: militaryUnit.branch,
            deviceDescription:  sql<string>`
              ${deviceType.brandName} || ' ' ||
              ${deviceType.deviceKind} || ' ' ||
              ${deviceType.description}
            `.as('deviceDescription')
          })
          .from(request)
          .leftJoin(deviceType, eq(request.deviceTypeId, deviceType.id))
          .leftJoin(militaryUnit, eq(request.militaryUnitId, militaryUnit.id))
          .where(eq(request.userId, userId));
        })
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
    )
      
  );

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

