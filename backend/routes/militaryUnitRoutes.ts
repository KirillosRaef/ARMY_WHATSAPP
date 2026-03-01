import { Elysia, t } from 'elysia';
import { db } from '../database';
import { createInsertMilitaryUnit, militaryUnit } from '../schema';
import { inArray } from 'drizzle-orm';

export const militaryUnitRoutes = new Elysia();

// Upload endpoint
  militaryUnitRoutes
    .onError((e) => {
      console.log(e);
    })
  .group('api', (militaryUnitRoutes) =>
    militaryUnitRoutes
      .get('/military-units', async () => {
        const militaryUnits = await db.select().from(militaryUnit);
        return militaryUnits;
      })
      .post('/military-unit', async ({ body }) => {
        await db.insert(militaryUnit).values(body);
        return body;
      }, {
        body: t.Omit(createInsertMilitaryUnit, ['id']),
      })
      .delete('/military-units-id', async ({ body: { militaryUnitIds } }) => {
        const result = await db.delete(militaryUnit).where(inArray(militaryUnit.id, militaryUnitIds));
        return result;
      }, {
        body: t.Object({
          militaryUnitIds: t.Array(t.String()),
        }),
      })
    .delete('/military-units', async () => {
      const result = await db.delete(militaryUnit);
      return result;
    })
  );