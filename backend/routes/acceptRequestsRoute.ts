import { Elysia, t } from 'elysia';
import { device, militaryUnit, request } from '../schema';
import { db } from '../database';
import { inArray, eq } from 'drizzle-orm';

export const acceptRequestsRoute = new Elysia();

acceptRequestsRoute.onError((e) => {
  console.log(e);
}).post('api/accept-requests', async ({ body: { requestIds } }) => {
      
  const data = await db.select({
    deviceTypeId: request.deviceTypeId,
    militaryUnitId: militaryUnit.id,
    serialNumber: request.serialNumber,
    usage: request.usage,
    username: request.username,
    devicePhoto: request.devicePhoto,
    serialNumberPhoto: request.serialNumberPhoto,
  }).from(request).where(inArray(request.id, requestIds))
    .innerJoin(militaryUnit, eq(request.militaryUnitId, militaryUnit.id));
  
  await db.insert(device).values(data);
  return { Success: true };
},
  {
    body: t.Object({
      requestIds: t.Array(t.String()),
    }),
  },
);