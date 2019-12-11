import {BASE_WORKER_CREEP_BODY, REPAIRER_BODY, REPAIRER_HEALTH_LIMIT_RATIO, REPAIRERS_COUNT_LIMIT} from "./config";
import CreepTrait from "./creep_traits";
import WorkRestCycleCreepRole from "./role.work_rest_cycle_creep";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const _ = require('lodash');

const FORBIDDEN_STRUCTURES: StructureConstant[] = [
    STRUCTURE_WALL,
    STRUCTURE_RAMPART,
];

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_LINK,
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
];

export default class RepairerRole extends WorkRestCycleCreepRole<AnyStructure> {
    public getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(REPAIRERS_COUNT_LIMIT, this);
    }

    protected shouldRenewTarget(creep: Creep, game: Game): boolean {
        const current = this.getCurrentStructureTarget(creep);

        if (!current) {
            return undefined;
        }

        return (current.hits / current.hitsMax) > REPAIRER_HEALTH_LIMIT_RATIO;
    }

    protected getTarget(creep: Creep): AnyStructure | null {
        return creep.room.find(FIND_STRUCTURES, {
            filter: object => !FORBIDDEN_STRUCTURES.includes(object.structureType) && object.hits < object.hitsMax
        }).sort(Utils.sortByHealthPercent()).shift();
    }

    protected getBody(game: Game): BodyPartConstant[] {
        const currentCreepCount = this.getCurrentCreepCount(game);
        if (currentCreepCount === 1) {
            return BASE_WORKER_CREEP_BODY;
        }

        return REPAIRER_BODY;
    }

    protected getRoleName(): string {
        return 'repairer';
    }

    protected rest(creep: Creep, game: Game): void {
        CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, SOURCE_STRUCTURES, 250));
    }

    protected shouldRest(creep: Creep, game: Game): boolean {
        return creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0;
    }

    protected shouldWork(creep: Creep, game: Game): boolean {
        return creep.store.getFreeCapacity() === 0;
    }

    protected work(creep: Creep, game: Game): void {
        CreepTrait.build(creep, this.getCurrentStructureTarget(creep));
    }

    private getCurrentCreepCount(game: Game): Number {
        return _.filter(game.creeps, (creep: Creep) => this.match(creep)).length;
    }
}
