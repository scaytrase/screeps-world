import {TOWER_KEEPERS_COUNT_LIMIT} from "./config";
import {BASE_CARRIER_CREEP_BODY, CARRIER_BODIES} from "./const";
import CreepTrait from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
];

const TARGET_STRUCTURES: StructureConstant[] = [
    STRUCTURE_TOWER,
];

export default class TowerKeeperRole extends BaseCreepRole {
    getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy([
            new LimitedSpawnByRoleCountStrategy(TOWER_KEEPERS_COUNT_LIMIT, this),
            new FoundMoreThanLimitSpawnStrategy(0, FIND_MY_STRUCTURES, {
                filter: (structure) =>
                    structure.structureType === STRUCTURE_TOWER &&
                    structure.store.getFreeCapacity() > 500
            })
        ]);
    }

    run(creep: Creep, game: Game): void {
        if (creep.store.getFreeCapacity() > 0) {
            CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, SOURCE_STRUCTURES));
        } else {
            CreepTrait.transferAllEnergy(creep, Utils.getClosestEnergyRecipient(creep, TARGET_STRUCTURES));
        }
    }

    protected getRoleName(): string {
        return 'tower_keeper';
    }

    protected getBody(game: Game, spawn: StructureSpawn): BodyPartConstant[] {
        const bodies = CARRIER_BODIES.filter(body => body.filter(part => part === CARRY).length <= 4);

        return Utils.getBiggerPossibleBodyNow(bodies, BASE_CARRIER_CREEP_BODY, spawn);
    }
}
