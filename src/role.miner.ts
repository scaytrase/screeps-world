import {BASE_WORKER_CREEP_BODY, WORKER_BODIES} from "./const";
import CreepTrait from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import RoleCountStrategy from "./spawn_strategy.role_count";
import RoomFindSpawnStrategy from "./spawn_strategy.room_find";
import Utils from "./utils";

const filter = (mineral: Mineral) => mineral.mineralAmount > 0;
export default class MinerRole extends BaseCreepRole {
    private static getRecipientStructure(creep: Creep): StructureStorage | null {
        return creep.room.find<StructureStorage>(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_STORAGE}}).shift();
    }

    private static getSourceStructure(creep: Creep): Mineral | null {
        return creep.room.find(FIND_MINERALS, {filter: filter}).shift();
    }

    run(creep: Creep): void {
        if (creep.store.getFreeCapacity() > 0) {
            CreepTrait.harvest(creep, MinerRole.getSourceStructure(creep));
        } else {
            CreepTrait.transferAllResources(creep, MinerRole.getRecipientStructure(creep));
        }
    }

    getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy(
            [
                new RoomFindSpawnStrategy(FIND_MINERALS, {filter: filter}),
                new RoomFindSpawnStrategy(FIND_MY_STRUCTURES, {filter: (structure) => structure.structureType === STRUCTURE_EXTRACTOR}),
                // @todo: rewrite walkable back
                RoleCountStrategy.room(2, this)
            ]
        );
    }

    public getRoleName(): string {
        return 'miner';
    }

    protected getBody(spawn: StructureSpawn) {
        return Utils.getBiggerPossibleBody(WORKER_BODIES, BASE_WORKER_CREEP_BODY, spawn);
    }
}
