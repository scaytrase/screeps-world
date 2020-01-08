import {BASE_WORKER_CREEP_BODY, WORKER_BODIES} from "./const";
import CreepTrait from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import {Sort} from "./sort_utils";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import RoomFindSpawnStrategy from "./spawn_strategy.room_find";
import Utils from "./utils";

const filter = (mineral: Mineral) => mineral.mineralAmount > 0;
const RECIPIENT_TYPES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_TERMINAL,
    STRUCTURE_CONTAINER,
];

export default class MinerRole extends BaseCreepRole {
    private static getRecipientStructure(creep: Creep): StructureStorage | null {
        return creep.room.find<StructureStorage>(FIND_MY_STRUCTURES, {filter: (structure) => RECIPIENT_TYPES.includes(structure.structureType)}).sort(Sort.byDistance(creep)).shift();
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
        const that = this;

        return new AndChainSpawnStrategy(
            [
                new RoomFindSpawnStrategy(FIND_MINERALS, {filter: filter}),
                new RoomFindSpawnStrategy(FIND_MY_STRUCTURES, {filter: (structure) => structure.structureType === STRUCTURE_EXTRACTOR}),
                {
                    shouldSpawn(spawn: StructureSpawn): boolean {
                        const current = Utils.findCreepsByRole(that, spawn.room).length;
                        const mineral = spawn.room.find(FIND_MINERALS).shift();
                        const walkable = Utils.getWalkablePositionsAround(mineral);

                        return current < Math.min(walkable, 2);
                    }
                }
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
