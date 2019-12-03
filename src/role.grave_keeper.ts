import {GRAVE_KEEPER_BODY, GRAVE_KEEPERS_COUNT} from "./config";
import CreepTrait from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const STORAGE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
];

const ENERGY_STORAGE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_EXTENSION,
    STRUCTURE_SPAWN,
    STRUCTURE_LINK,
];

const _ = require('lodash');

export default class GraveKeeperRole extends BaseCreepRole {
    private static getSource(creep: Creep): Resource | Tombstone | null {
        return [
            ...(creep.room.find(FIND_DROPPED_RESOURCES, {
                filter(resource) {
                    return resource.amount > 0
                        && Utils.isWithinTraversableBorders(resource);
                }

            })),
            ...(creep.room.find(FIND_TOMBSTONES, {
                filter(tombstone) {
                    return tombstone['store'][_.findKey(tombstone['store'])] > 0
                        && Utils.isWithinTraversableBorders(tombstone);
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
        if (creep['store'].getFreeCapacity() > 0 && creep.ticksToLive > 300) {
            CreepTrait.pickupAllResources(creep, GraveKeeperRole.getSource(creep));
        } else {
            CreepTrait.transferAllResources(creep, GraveKeeperRole.getTarget(creep));
        }
    }

    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(GRAVE_KEEPERS_COUNT, this);
    }

    protected getSpawnMemory(spawn: StructureSpawn, game: Game): object {
        return {
            suicide_from: 300,
            suicide_at: 100,
            suicide_destination: spawn.id
        };
    }

    protected getBody(game: Game): BodyPartConstant[] {
        return GRAVE_KEEPER_BODY;
    }

    protected getRoleName(): string {
        return 'grave_keeper';
    }
}
