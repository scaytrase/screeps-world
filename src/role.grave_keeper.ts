import Role from "./role";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import {GRAVE_KEEPER_BODY, GRAVE_KEEPERS_COUNT} from "./config";
import CreepTrait from "./creep_traits";

export const ROLE_GRAVE_KEEPER = 'grave_keeper';
const STORAGE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
];

const _ = require('lodash');

export default class GraveKeeperRole implements Role {
    private static getSource(creep: Creep): Resource | Tombstone | null {
        let resources = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter(resource) {
                return resource.amount > 0
            }

        });
        let tombstones = creep.room.find(FIND_TOMBSTONES, {
            filter(tombstone) {
                return tombstone['store'][_.findKey(tombstone['store'])] > 0;
            }
        });

        let targets: Array<Resource | Tombstone> = [];
        targets.push(...resources);
        targets.push(...tombstones);

        if (targets.length === 0) {
            return null;
        }

        targets = targets.sort((a, b) => Math.sign(a.pos.getRangeTo(creep) - b.pos.getRangeTo(creep)));

        return targets[0];
    }

    private static getTarget(creep: Creep): AnyStructure | null {
        let targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return STORAGE_STRUCTURES.includes(structure.structureType) &&
                    structure['store'].getFreeCapacity() > 0;
            }
        });

        targets = targets.sort((a, b) => Math.sign(a.pos.getRangeTo(creep) - b.pos.getRangeTo(creep)));

        if (targets.length > 0) {
            return targets[0];
        }

        return null;
    }

    run(creep: Creep): void {
        if (creep['store'].getFreeCapacity() > 0) {
            CreepTrait.pickup(creep, GraveKeeperRole.getSource(creep));
        } else {
            CreepTrait.transferAllResources(creep, GraveKeeperRole.getTarget(creep));
        }

        CreepTrait.renewIfNeeded(creep);
        CreepTrait.suicideOldCreep(creep, 100);
    }

    match(creep: Creep): boolean {
        return creep.memory['role'] == ROLE_GRAVE_KEEPER;
    }

    spawn(spawn: StructureSpawn, game: Game): void {
        spawn.spawnCreep(
            GraveKeeperRole.getBody(game),
            'GraveKeeper' + game.time,
            {memory: {role: ROLE_GRAVE_KEEPER}}
        )
    }


    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(GRAVE_KEEPERS_COUNT, this);
    }

    private static getBody(game: Game): BodyPartConstant[] {
        return GRAVE_KEEPER_BODY;
    }
}
