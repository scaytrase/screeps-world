import {UPGRADER_BODY, UPGRADERS_COUNT, UPGRADERS_ENERGY_LIMIT} from "./config";
import CreepTrait from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_LINK,
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
];

export default class UpgraderRole extends BaseCreepRole {
    run(creep: Creep, game: Game): void {
        if (creep.memory['upgrading'] && creep['store'][RESOURCE_ENERGY] == 0) {
            creep.memory['upgrading'] = false;
            creep.say('🔄 harvest');
        } else if (!creep.memory['upgrading'] && creep['store'].getFreeCapacity() == 0) {
            creep.memory['upgrading'] = true;
            creep.say('⚡ upgrade');
        }

        if (creep.memory['upgrading']) {
            CreepTrait.upgradeController(creep);
        } else {
            CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, SOURCE_STRUCTURES, UPGRADERS_ENERGY_LIMIT));
        }
    }

    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(UPGRADERS_COUNT, this);
    }

    protected getRoleName(): string {
        return 'upgrader';
    }

    protected getBody(game: Game): BodyPartConstant[] {
        return UPGRADER_BODY;
    }
}
