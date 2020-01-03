import {BASE_CARRIER_CREEP_BODY, CARRIER_BODIES, GRAVE_KEEPERS_COUNT_LIMIT, GRAVE_KEEPERS_LOOT_BORDERS} from "./config";
import CreepTrait from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import NotEmptyCallableResult from "./spawn_strategy.not_empty_callable_result";
import Utils from "./utils";

const STORAGE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_TERMINAL,
    STRUCTURE_SPAWN,
];

const ENERGY_STORAGE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_EXTENSION,
    STRUCTURE_SPAWN,
    STRUCTURE_LINK,
    STRUCTURE_TERMINAL,
];

const getRoomGraves = (room: Room) => [
    ...(room.find(FIND_DROPPED_RESOURCES, {
        filter(resource) {
            return resource.amount > 0
                && (GRAVE_KEEPERS_LOOT_BORDERS || Utils.isWithinTraversableBorders(resource));
        }
    })),
    ...(room.find(FIND_TOMBSTONES, {
        filter(tombstone) {
            return tombstone.store.getUsedCapacity() > 0
                && (GRAVE_KEEPERS_LOOT_BORDERS || Utils.isWithinTraversableBorders(tombstone));
        }
    })),
    ...(room.find(FIND_RUINS, {
        filter(ruin) {
            return ruin.store.getUsedCapacity() > 0;
        }
    }))
];

export default class GraveKeeperRole extends BaseCreepRole {
    private static getSource(creep: Creep): Resource | Tombstone | Ruin | null {
        return getRoomGraves(creep.room).sort(Utils.sortByDistance(creep)).shift();
    }

    private static getTarget(creep: Creep): AnyStructure | null {
        if (creep.store.getUsedCapacity() === creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
            return creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ENERGY_STORAGE_STRUCTURES.includes(structure.structureType) &&
                        structure['store'].getFreeCapacity() > 0;
                }
            }).sort(Utils.sortByDistance(creep)).shift();
        }

        return creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return STORAGE_STRUCTURES.includes(structure.structureType) &&
                    structure['store'].getFreeCapacity() > 0;
            }
        }).sort(Utils.sortByDistance(creep)).shift();
    }

    run(creep: Creep, game: Game): void {
        const source = GraveKeeperRole.getSource(creep);
        if (source && creep.store.getFreeCapacity() > 0 && creep.ticksToLive > 100) {
            CreepTrait.pickupAllResources(creep, source);
        } else if (creep.store.getUsedCapacity() > 0) {
            CreepTrait.transferAllResources(creep, GraveKeeperRole.getTarget(creep));
        } else {
            CreepTrait.goToParking(creep, game);
        }
    }

    getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy([
            new NotEmptyCallableResult((game, spawn) => getRoomGraves(spawn.room).shift()),
            new LimitedSpawnByRoleCountStrategy(GRAVE_KEEPERS_COUNT_LIMIT, this)
        ]);
    }

    protected getBody(game: Game, spawn: StructureSpawn): BodyPartConstant[] {
        const upgraderBodies = CARRIER_BODIES.filter(body => body.filter(part => part === CARRY).length <= 4);

        return Utils.getBiggerPossibleBodyNow(upgraderBodies, BASE_CARRIER_CREEP_BODY, spawn);
    }

    protected getRoleName(): string {
        return 'grave_keeper';
    }
}
