import {GRAVE_KEEPER_BODY, GRAVE_KEEPERS_COUNT_LIMIT, GRAVE_KEEPERS_LOOT_BORDERS} from "./config";
import CreepTrait from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const STORAGE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_TERMINAL,
];

const ENERGY_STORAGE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_EXTENSION,
    STRUCTURE_SPAWN,
    STRUCTURE_LINK,
    STRUCTURE_TERMINAL,
];

const _ = require('lodash');

export default class GraveKeeperRole extends BaseCreepRole {
    private static getSource(creep: Creep): Resource | Tombstone | Ruin | null {
        return [
            ...(creep.room.find(FIND_DROPPED_RESOURCES, {
                filter(resource) {
                    return resource.amount > 0
                        && (GRAVE_KEEPERS_LOOT_BORDERS || Utils.isWithinTraversableBorders(resource));
                }
            })),
            ...(creep.room.find(FIND_TOMBSTONES, {
                filter(tombstone) {
                    return tombstone.store.getUsedCapacity() > 0
                        && (GRAVE_KEEPERS_LOOT_BORDERS || Utils.isWithinTraversableBorders(tombstone));
                }
            })),
            ...(creep.room.find(FIND_RUINS, {
                filter(ruin) {
                    return ruin.store.getUsedCapacity() > 0;
                }
            }))
        ].sort(Utils.sortByDistance(creep)).shift();
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
        }
    }

    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(GRAVE_KEEPERS_COUNT_LIMIT, this);
    }

    protected getBody(game: Game): BodyPartConstant[] {
        return GRAVE_KEEPER_BODY;
    }

    protected getRoleName(): string {
        return 'grave_keeper';
    }
}
