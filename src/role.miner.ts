import {WORKER_BODIES, WORKER_CREEP_BODY_LVL3} from "./config";
import CreepTrait from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const filter = (mineral: Mineral) => mineral.mineralAmount > 0;
export default class MinerRole extends BaseCreepRole {
    private static getRecipientStructure(creep: Creep): StructureStorage | null {
        return creep.room.find<StructureStorage>(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_STORAGE}}).shift();
    }

    private static getSourceStructure(creep: Creep): Mineral | null {
        return creep.room.find(FIND_MINERALS, {filter: filter}).shift();
    }

    run(creep: Creep, game: Game): void {
        if (creep.store.getFreeCapacity() > 0) {
            CreepTrait.harvest(creep, MinerRole.getSourceStructure(creep));
        } else {
            CreepTrait.transferAllResources(creep, MinerRole.getRecipientStructure(creep));
        }
    }

    getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy(
            [
                new FoundMoreThanLimitSpawnStrategy(0, FIND_MINERALS, {filter: filter}),
                new FoundMoreThanLimitSpawnStrategy(0, FIND_MY_STRUCTURES, {filter: (structure) => structure.structureType === STRUCTURE_EXTRACTOR}),
                new LimitedSpawnByRoleCountStrategy(1, this, (
                    spawn => spawn.room
                        .find(FIND_MINERALS)
                        .map(mineral => Utils.getWalkablePositionsAround(mineral))
                        .reduce((p, v) => p + v, 0)
                ))
            ]
        );
    }

    protected getBody(game: Game, spawn: StructureSpawn) {
        return Utils.getBiggerPossibleBody(WORKER_BODIES, WORKER_CREEP_BODY_LVL3, spawn);
    }

    protected getRoleName(): string {
        return 'miner';
    }
}
