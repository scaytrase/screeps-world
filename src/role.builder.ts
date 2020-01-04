import {BUILDERS_COUNT_LIMIT, RAMPART_INITIAL_HITS} from "./config";
import {BASE_WORKER_CREEP_BODY, WORKER_BODIES} from "./const";
import CreepTrait from "./creep_traits";
import WorkRestCycleCreepRole from "./role.work_rest_cycle_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
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
                new FoundMoreThanLimitSpawnStrategy(0, FIND_MY_CONSTRUCTION_SITES),
                new LimitedSpawnByRoleCountStrategy(BUILDERS_COUNT_LIMIT, this),
            ]
        );
    }

    protected shouldWork(creep: Creep, game: Game): boolean {
        return creep.store.getFreeCapacity() == 0;
    }

    protected shouldRest(creep: Creep, game: Game): boolean {
        return creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
    }

    protected work(creep: Creep, game: Game): void {
        const target = this.getCurrentStructureTarget(creep);
        if (target) {
            CreepTrait.build(creep, target);
        } else {
            CreepTrait.goToParking(creep, game);
        }
    }

    protected rest(creep: Creep, game: Game): void {
        CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, [STRUCTURE_CONTAINER, STRUCTURE_STORAGE], 100));
        CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, SOURCE_STRUCTURES, Utils.getBodyCost(BASE_WORKER_CREEP_BODY) + 50));
    }

    protected shouldRenewTarget(creep: Creep, game: Game): boolean {
        const target = this.getCurrentStructureTarget(creep);

        if (target instanceof ConstructionSite) {
            return false;
        }

        return target instanceof StructureRampart && target.hits > RAMPART_INITIAL_HITS;
    }

    protected getTarget(creep: Creep, game: Game): ConstructionSite | StructureRampart {
        const rampart = creep.room
            .find<StructureRampart>(FIND_MY_STRUCTURES, {
                filter: (rampart) => rampart.structureType === STRUCTURE_RAMPART && rampart.hits < RAMPART_INITIAL_HITS
            })
            .sort(Utils.sortByDistance(creep))
            .shift();

        if (rampart) {
            return rampart;
        }

        return creep.room
            .find(FIND_CONSTRUCTION_SITES)
            .sort(Utils.sortByDistance(creep.room.find(FIND_MY_SPAWNS).shift()))
            .shift();
    }

    protected getBody(game: Game, spawn: StructureSpawn): BodyPartConstant[] {
        if (this.isPrioritySpawn(spawn, game)) {
            return Utils.getBiggerPossibleBodyNow(WORKER_BODIES, BASE_WORKER_CREEP_BODY, spawn);
        }

        return Utils.getBiggerPossibleBody(WORKER_BODIES, BASE_WORKER_CREEP_BODY, spawn);
    }

    protected getRoleName(): string {
        return ROLE_BUILDER;
    }
}
