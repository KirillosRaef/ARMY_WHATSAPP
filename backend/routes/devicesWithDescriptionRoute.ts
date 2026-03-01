import Elysia from "elysia";
import { db } from "../database";
import { device, deviceType, militaryUnit } from "../schema";
import { eq } from "drizzle-orm";


export const devicesWithDescriptionRoute = new Elysia();

devicesWithDescriptionRoute.onError(({error}) => {
    console.log(error);
    return error;
}).get("/api/devices-with-description", async () => {
    return await db.select({
      id: device.id,
      brandLogo: deviceType.brandLogo,
      brandName: deviceType.brandName,
      deviceKind: deviceType.deviceKind,
      description: deviceType.description,
      serialNumber: device.serialNumber,
      usage: device.usage,
      devicePhoto: device.devicePhoto,
      serialNumberPhoto: device.serialNumberPhoto,
      militaryUnitId: device.militaryUnitId,
      militaryUnitName: militaryUnit.militaryUnitName,
      branch: militaryUnit.branch,
      username: device.username,
    }).from(device)
      .leftJoin(deviceType, eq(device.deviceTypeId, deviceType.id))
      .leftJoin(militaryUnit, eq(device.militaryUnitId, militaryUnit.id));
});