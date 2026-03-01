import { Elysia, t } from 'elysia';
import { device, request } from '../schema';
import { db } from '../database';
import { inArray } from 'drizzle-orm';

export const acceptRequestsRoute = new Elysia();

acceptRequestsRoute.onError((e) => {
  console.log(e);
}).post('api/accept-requests', async ({ body: { requestIds } }) => {
  const data = await db.select({
    deviceTypeId: request.deviceTypeId,
    serialNumber: request.serialNumber,
    usage: request.usage,
    devicePhoto: request.devicePhoto,
    serialNumberPhoto: request.serialNumberPhoto,
  }).from(request).where(inArray(request.id, requestIds));
  
  await db.insert(device).values(data);
  return { Success: true };
},
  {
    body: t.Object({
      requestIds: t.Array(t.String()),
    }),
  },
);