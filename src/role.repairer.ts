import {
    REPAIRER_HEALTH_EMERGENCY_RATIO,
    REPAIRER_HEALTH_LOWER_RATIO,
    REPAIRER_HEALTH_UPPER_RATIO,
    REPAIRERS_COUNT_LIMIT
} from "./config";
import {BASE_WORKER_CREEP_BODY, WORKER_BODIES} from "./const";
import CreepTrait from "./creep_traits";
import EconomyUtils from "./economy_utils";
import WorkRestCycleCreepRole from "./role.work_rest_cycle_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const FORBIDDEN_STRUCTURES: StructureConstant[] = [
    STRUCTURE_WALL,
    STRUCTURE_RAMPART,
];

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_LINK,
    STRUCTURE_SPAWN,
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_TERMINAL,
];

export default class RepairerRole extends WorkRestCycleCreepRole<AnyStructure> {
    public getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy([
            new LimitedSpawnByRoleCountStrategy(REPAIRERS_COUNT_LIMIT, this),
            new FoundMoreThanLimitSpawnStrategy(0, FIND_STRUCTURES, {filter: this.filter()})
        ]);
    }

    public isPrioritySpawn(spawn: StructureSpawn, game: Game): boolean {
        return this.isEmergency(spawn.room) && EconomyUtils.usableSpawnEnergyAvailable(spawn.room) > 2000;
    }

    protected shouldRenewTarget(creep: Creep, game: Game): boolean {
        const current = this.getCurrentStructureTarget(creep);

        if (!current) {
            return true;
        }
        const emergency = this.isEmergency(creep.room);

        const hitsRation = current.hits / current.hitsMax;

        if (hitsRation > REPAIRER_HEALTH_LOWER_RATIO * 1.05 && emergency) {
            return true;
        }

        return (hitsRation) > REPAIRER_HEALTH_UPPER_RATIO;
    }

    protected getTarget(creep: Creep): AnyStructure | null {
        return creep.room
            .find(FIND_STRUCTURES, {filter: this.filter()})
            .sort(Utils.sortByHealthPercent())
            .shift();
    }

    protected getBody(game: Game, spawn: StructureSpawn): BodyPartConstant[] {
        if (this.isPrioritySpawn(spawn, game)) {
            return Utils.getBiggerPossibleBodyNow(WORKER_BODIES, BASE_WORKER_CREEP_BODY, spawn);
        }

        return Utils.getBiggerPossibleBody(WORKER_BODIES, BASE_WORKER_CREEP_BODY, spawn);
    }

    protected getRoleName(): string {
        return 'repairer';
    }

    protected rest(creep: Creep, game: Game): void {
        CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, SOURCE_STRUCTURES, 200));
    }

    protected shouldRest(creep: Creep, game: Game): boolean {
        return creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0;
    }

    protected shouldWork(creep: Creep, game: Game): boolean {
        return creep.store.getFreeCapacity() === 0;
    }

    protected work(creep: Creep, game: Game): void {
        const target = this.getCurrentStructureTarget(creep);
        if (target) {
            CreepTrait.build(creep, target);
        } else {
            CreepTrait.goToParking(creep, game);
        }
    }

    private filter() {
        return object => !FORBIDDEN_STRUCTURES.includes(object.structureType) &&
            ((object.hits / object.hitsMax) < REPAIRER_HEALTH_LOWER_RATIO);
    }

    private isEmergency(room: Room) {
        const emergencyFilter = object => !FORBIDDEN_STRUCTURES.includes(object.structureType) &&
            ((object.hits / object.hitsMax) < REPAIRER_HEALTH_EMERGENCY_RATIO);

        return room.find(FIND_STRUCTURES, {filter: emergencyFilter}).length > 0;
    }
}
