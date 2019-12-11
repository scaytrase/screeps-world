import EconomyUtils from "./economy";
import Runnable from "./runnable";

type ENERGY_STORAGE = StructureStorage | StructureLink | StructureExtension | StructureContainer | StructureTower;

const store_types: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_LINK,
    STRUCTURE_EXTENSION,
    STRUCTURE_CONTAINER,
    STRUCTURE_TOWER,
    STRUCTURE_SPAWN,
];

export default class EconomyLogger implements Runnable {
    public run(game: Game, memory: Memory): void {
        const spawn: StructureSpawn = Object.values(game.spawns).shift();

        const energyStores: ENERGY_STORAGE[] = spawn.room.find<ENERGY_STORAGE>(FIND_STRUCTURES, {filter: (structure) => store_types.includes(structure.structureType)});

        const available: number = energyStores
            .map(storage => storage.store)
            .map((currentStore: StoreDefinition) => currentStore.getUsedCapacity(RESOURCE_ENERGY))
            .reduce((p, x) => p + x, 0);

        const max: number = energyStores
            .map(storage => storage.store)
            .map((currentStore: StoreDefinition) => currentStore.getCapacity(RESOURCE_ENERGY))
            .reduce((p, x) => p + x, 0);

        console.log(
            `
             💰 Economy level: ${EconomyUtils.getCurrentEconomyLevel(game, memory)}
             ❤️ Spawn energy level: ${spawn.room.energyAvailable} of ${spawn.room.energyCapacityAvailable} (${Math.round(100 * spawn.room.energyAvailable / spawn.room.energyCapacityAvailable)}%)
             ${this.getStorageMessage(spawn.room)}
             🔋 Total energy resources: ${available} of ${max} (${Math.round(100 * available / max)}%) 
            `
        );
    }

    private getStorageMessage(room: Room): String {
        if (!room.storage) {
            return `🚫 No store`;
        }

        const store = room.storage.store;

        return `Storage energy level: ${store.getUsedCapacity(RESOURCE_ENERGY)} of ${store.getCapacity(RESOURCE_ENERGY)} (${Math.round(100 * store.getUsedCapacity(RESOURCE_ENERGY) / store.getCapacity(RESOURCE_ENERGY))}%)`;
    }
}
