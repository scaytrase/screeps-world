import {WALL_DESIRED_HITS, WALL_KEEPER_BODY, WALL_KEEPERS_COUNT} from "./config";
import CreepTrait from "./creep_traits";
import TargetAwareCreepRole from "./role.target_aware_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const _ = require('lodash');

const TARGET_STRUCTURES: StructureConstant[] = [
    STRUCTURE_WALL,
    STRUCTURE_RAMPART,
];
const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
];

const repairFilter = (object: AnyStructure) => TARGET_STRUCTURES.includes(object.structureType) && object.hits < WALL_DESIRED_HITS;

export default class WallKeeperRole extends TargetAwareCreepRole {
    doRun(creep: Creep, game: Game): void {
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

    public getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy(
            [
                new FoundMoreThanLimitSpawnStrategy(0, FIND_STRUCTURES, {filter: repairFilter}),
                new LimitedSpawnByRoleCountStrategy(WALL_KEEPERS_COUNT, this),
            ]
        );
    }

    protected shouldRenewTarget(creep: Creep, game: Game): boolean {
        const current = this.getCurrentStructureTarget(creep);

        if (!current) {
            return undefined;
        }

        return current.hits > WALL_DESIRED_HITS;
    }

    protected getRoleName(): string {
        return 'wall_keeper';
    }

    protected getBody(game: Game) {
        return WALL_KEEPER_BODY;
    }

    protected getTarget(creep: Creep, game: Game): AnyStructure | null {
        return creep.room.find(FIND_STRUCTURES, {filter: repairFilter}).sort((a, b) => a.hits / a.hitsMax - b.hits / b.hitsMax).shift();
    }
}
