import {BUILDERS_COUNT_LIMIT, RAMPART_INITIAL_HITS} from "./config";
import {BASE_WORKER_CREEP_BODY, WORKER_BODIES} from "./const";
import CreepTrait from "./creep_traits";
import WorkRestCycleCreepRole from "./role.work_rest_cycle_creep";
import {Sort} from "./sort_utils";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import RoleCountStrategy from "./spawn_strategy.role_count";
import RoomFindSpawnStrategy from "./spawn_strategy.room_find";
import Utils from "./utils";

const ROLE_BUILDER = 'builder';

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_LINK,
    STRUCTURE_SPAWN,
    STRUCTURE_TERMINAL
];

export default class BuilderRole extends WorkRestCycleCreepRole<ConstructionSite | StructureRampart> {
    getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy(
            [
                new RoomFindSpawnStrategy(FIND_MY_CONSTRUCTION_SITES),
                RoleCountStrategy.room(BUILDERS_COUNT_LIMIT, this),
            ]
        );
    }

    public getRoleName(): string {
        return ROLE_BUILDER;
    }

    protected shouldWork(creep: Creep): boolean {
        return creep.store.getFreeCapacity() == 0;
    }

    protected shouldRest(creep: Creep): boolean {
        return creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
    }

    protected work(creep: Creep): void {
        CreepTrait.build(creep, this.getCurrentStructureTarget(creep));
    }

    protected rest(creep: Creep): void {
        CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, [STRUCTURE_CONTAINER, STRUCTURE_STORAGE], 100));
        CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, SOURCE_STRUCTURES, Utils.getBodyCost(BASE_WORKER_CREEP_BODY) + 50));
    }

    protected shouldRenewTarget(creep: Creep): boolean {
        const target = this.getCurrentStructureTarget(creep);

        if (target instanceof ConstructionSite) {
            return false;
        }

        return target instanceof StructureRampart && target.hits > RAMPART_INITIAL_HITS;
    }

    protected getTarget(creep: Creep): ConstructionSite | StructureRampart {
        const rampart = creep.room
            .find<StructureRampart>(FIND_MY_STRUCTURES, {
                filter: (rampart) => rampart.structureType === STRUCTURE_RAMPART && rampart.hits < RAMPART_INITIAL_HITS
            })
            .sort(Sort.byDistance(creep))
            .shift();

        if (rampart) {
            return rampart;
        }

        return creep.room
            .find(FIND_CONSTRUCTION_SITES)
            .sort(Sort.byDistance(creep.room.find(FIND_MY_SPAWNS).shift()))
            .shift();
    }

    protected getBody(spawn: StructureSpawn): BodyPartConstant[] {
        if (this.isPrioritySpawn(spawn)) {
            return Utils.getBiggerPossibleBodyNow(WORKER_BODIES, BASE_WORKER_CREEP_BODY, spawn);
        }

        return Utils.getBiggerPossibleBody(WORKER_BODIES, BASE_WORKER_CREEP_BODY, spawn);
    }
}
