import Economy from "./economy";
import EconomyUtils from "./economy_utils";
import Runnable from "./runnable";

export default class EconomyLogger implements Runnable {
    private static getSpawnMessage(spawn: StructureSpawn): String {
        const available = spawn.room.energyAvailable;
        const max = spawn.room.energyCapacityAvailable;

        return `❤️ Spawn energy level: ${available} of ${max} (${Math.round(100 * available / max)}%)`;
    }

    private static getEconomyMessage(spawn: StructureSpawn, game: Game, memory: Memory): String {
        return `💰 Economy level: ${Economy.getCurrentEconomyLevel(spawn.room, game, memory)}`;
    }

    private static getTotalMessage(spawn: StructureSpawn): String {

        const available: number = EconomyUtils.usableSpawnEnergyAvailable(spawn);
        const max: number = EconomyUtils.usableSpawnEnergyMax(spawn);

        return `🔋 Total energy resources: ${available} of ${max} (${Math.round(100 * available / max)}%) `;
    }

    private static getStorageMessage(room: Room): String {
        if (!room.storage) {
            return `🚫 No store`;
        }

        const store = room.storage.store;

        return `💳 Storage energy level: ${store.getUsedCapacity(RESOURCE_ENERGY)} of ${store.getCapacity(RESOURCE_ENERGY)} (${Math.round(100 * store.getUsedCapacity(RESOURCE_ENERGY) / store.getCapacity(RESOURCE_ENERGY))}%)`;
    }

    public run(game: Game, memory: Memory): void {
        const spawn: StructureSpawn = Object.values(game.spawns).shift();

        console.log();
        console.log();
        console.log();
        console.log();

        console.log(
            `
             ${EconomyLogger.getEconomyMessage(spawn, game, memory)}
             ${EconomyLogger.getSpawnMessage(spawn)}
             ${EconomyLogger.getStorageMessage(spawn.room)}
             ${EconomyLogger.getTotalMessage(spawn)} 
            `
        );
    }
}
