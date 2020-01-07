const store_types: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_LINK,
    STRUCTURE_EXTENSION,
    STRUCTURE_CONTAINER,
    STRUCTURE_SPAWN,
];

type ENERGY_STORAGE = StructureStorage | StructureLink | StructureExtension | StructureContainer;

export default class EconomyUtils {
    public static usableSpawnEnergyRatio(room: Room): number {
        return this.usableSpawnEnergyAvailable(room) / this.usableSpawnEnergyMax(room);
    }

    public static usableSpawnEnergyMax(room: Room) {
        const energyStores: ENERGY_STORAGE[] = room.find<ENERGY_STORAGE>(FIND_STRUCTURES, {
            filter: (structure) => store_types.includes(structure.structureType)
        });

        return energyStores
            .map(storage => storage.store)
            .map((currentStore: StoreDefinition) => currentStore.getCapacity(RESOURCE_ENERGY))
            .reduce((p, x) => p + x, 0);

    }

    public static usableSpawnEnergyAvailable(room: Room) {
        const energyStores: ENERGY_STORAGE[] = room.find<ENERGY_STORAGE>(FIND_STRUCTURES, {
            filter: (structure) => store_types.includes(structure.structureType)
        });

        return energyStores
            .map(storage => storage.store)
            .map((currentStore: StoreDefinition) => currentStore.getUsedCapacity(RESOURCE_ENERGY))
            .reduce((p, x) => p + x, 0);
    }
}
