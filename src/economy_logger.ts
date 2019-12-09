import EconomyUtils from "./economy";
import Runnable from "./runnable";

type ENERGY_STORAGE = StructureStorage | StructureLink | StructureExtension | StructureContainer | StructureTower;

const store_types: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_LINK,
    STRUCTURE_EXTENSION,
    STRUCTURE_CONTAINER,
    STRUCTURE_TOWER
];

export default class EconomyLogger implements Runnable {
    public run(game: Game, memory: Memory): void {
        const spawn: StructureSpawn = Object.values(game.spawns).shift();
        const store: StructureStorage = spawn.room.storage;

        const energyStores: ENERGY_STORAGE[] = spawn.room.find<ENERGY_STORAGE>(FIND_MY_STRUCTURES, {filter: (structure) => store_types.includes(structure.structureType)});

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
             Economy level: ${EconomyUtils.getCurrentEconomyLevel(game, memory)}
             Spawn energy level: ${spawn.room.energyAvailable} of ${spawn.room.energyCapacityAvailable} (${Math.round(100 * spawn.room.energyAvailable / spawn.room.energyCapacityAvailable)}%)
             Storage energy level: ${store.store.getUsedCapacity(RESOURCE_ENERGY)} of ${store.store.getCapacity(RESOURCE_ENERGY)} (${Math.round(100 * store.store.getUsedCapacity(RESOURCE_ENERGY) / store.store.getCapacity(RESOURCE_ENERGY))}%)
             Total energy resources: ${available} of ${max} (${Math.round(100 * available / max)}%) 
            `
        );
    }
}
