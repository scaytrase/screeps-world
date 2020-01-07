import Economy from "./economy";
import EconomyUtils from "./economy_utils";
import Runnable from "./runnable";

export default class EconomyLogger implements Runnable {
    private static getSpawnMessage(spawn: StructureSpawn): String {
        const available = spawn.room.energyAvailable;
        const max = spawn.room.energyCapacityAvailable;

        return `❤️ Spawn energy level: ${available} of ${max} (${Math.round(100 * available / max)}%)`;
    }

    private static getEconomyMessage(spawn: StructureSpawn): String {
        return `💰 Economy level: ${Economy.getCurrentEconomyLevel(spawn.room)}`;
    }

    private static getTotalMessage(room: Room): String {

        const available: number = EconomyUtils.usableSpawnEnergyAvailable(room);
        const max: number = EconomyUtils.usableSpawnEnergyMax(room);

        return `🔋 Total energy resources: ${available} of ${max} (${Math.round(100 * available / max)}%) `;
    }

    private static getStorageMessage(room: Room): String {
        if (!room.storage) {
            return `🚫 No store`;
        }

        const store = room.storage.store;

        return `💳 Storage energy level: ${store.getUsedCapacity(RESOURCE_ENERGY)} of ${store.getCapacity(RESOURCE_ENERGY)} (${Math.round(100 * store.getUsedCapacity(RESOURCE_ENERGY) / store.getCapacity(RESOURCE_ENERGY))}%)`;
    }

    public run(): void {

        Object.values(Game.spawns).map(
            (spawn: StructureSpawn) => console.log(
                `
             ROOM: ${spawn.room.name}
             ${EconomyLogger.getEconomyMessage(spawn)}
             ${EconomyLogger.getSpawnMessage(spawn)}
             ${JSON.stringify(spawn.spawning)}
             ${EconomyLogger.getStorageMessage(spawn.room)}
             ${EconomyLogger.getTotalMessage(spawn.room)}
              
            `
            )
        );
    }
}
