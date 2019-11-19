import {REPAIRER_ADVANCED_BODY, REPAIRER_BODY, REPAIRER_HEALTH_LIMIT_RATIO, REPAIRERS_COUNT} from "./config";
import CreepTrait from "./creep_traits";
import TargetAwareCreepRole from "./role.target_aware_creep";
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

export default class RepairerRole extends TargetAwareCreepRole {
    public getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(REPAIRERS_COUNT, this);
    }

    protected doRun(creep: Creep, game: Game): void {
        if (creep.memory['repairing'] && creep['store'][RESOURCE_ENERGY] == 0) {
            creep.memory['repairing'] = false;
            creep.say('🔄 harvest');
        } else if (!creep.memory['repairing'] && creep['store'].getFreeCapacity() == 0) {
            creep.memory['repairing'] = true;
            creep.say('🚧 repair');
        }

        if (creep.memory['repairing']) {
            CreepTrait.repair(creep, this.getCurrentStructureTarget(creep));
        } else {
            CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, SOURCE_STRUCTURES, creep.carryCapacity));
        }
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
        if (currentCreepCount < 3) {
            return REPAIRER_BODY;
        }

        return REPAIRER_ADVANCED_BODY;
    }

    protected getRoleName(): string {
        return 'repairer';
    }

    private getCurrentCreepCount(game: Game): Number {
        return _.filter(game.creeps, (creep: Creep) => this.match(creep)).length;
    }
}
