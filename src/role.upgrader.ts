import {BASE_WORKER_CREEP_BODY, UPGRADERS_COUNT_LIMIT, WORKER_BODIES} from "./config";
import CreepTrait from "./creep_traits";
import Economy from "./economy";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import EmergencySpawnStrategy from "./spawn_strategy.emergency";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import NotSpawnStrategy from "./spawn_strategy.not";
import OrChainSpawnStrategy from "./spawn_strategy.or_chain";
import Utils from "./utils";

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_LINK,
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_SPAWN,
];

const _ = require('lodash');

export default class UpgraderRole extends BaseCreepRole {
    public run(creep: Creep, game: Game): void {
        if (creep.memory['upgrading'] && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory['upgrading'] = false;
            creep.say('🔄 harvest');
        } else if (!creep.memory['upgrading'] && creep.store.getFreeCapacity() == 0) {
            creep.memory['upgrading'] = true;
            creep.say('⚡ upgrade');
        }

        if (creep.memory['upgrading']) {
            CreepTrait.upgradeController(creep);
        } else {
            CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, SOURCE_STRUCTURES, 100));
        }
    }

    public isPrioritySpawn(spawn: StructureSpawn, game: Game): boolean {
        return Utils.findCreepsByRole(game, this, spawn.room).length === 0;
    }

    public getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy([
            new LimitedSpawnByRoleCountStrategy(UPGRADERS_COUNT_LIMIT, this),
            new OrChainSpawnStrategy([
                new NotSpawnStrategy(
                    new EmergencySpawnStrategy((spawn, game) => Economy.isHarvesterEmergency(spawn.room, game))
                ),
                new LimitedSpawnByRoleCountStrategy(1, this),
            ])
        ]);
    }

    protected getRoleName(): string {
        return 'upgrader';
    }

    protected getBody(game: Game, spawn: StructureSpawn): BodyPartConstant[] {
        if (spawn.room.controller.level === 8) {
            return BASE_WORKER_CREEP_BODY;
        }

        if (Utils.findCreepsByRole(game, this, spawn.room).length === 0) {
            return Utils.getBiggerPossibleBodyNow(WORKER_BODIES, BASE_WORKER_CREEP_BODY, spawn);
        }

        return Utils.getBiggerPossibleBody(WORKER_BODIES, BASE_WORKER_CREEP_BODY, spawn);
    }
}
