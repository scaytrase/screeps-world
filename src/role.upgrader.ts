import {
    AGGRESSIVE_UPGRADING_WORK,
    MAX_WORK_PER_CONTROLLER,
    MAX_WORK_PER_CONTROLLER_EMERGENCY,
    UPGRADERS_COUNT_LIMIT
} from "./config";
import {BASE_WORKER_CREEP_BODY, WORKER_BODIES} from "./const";
import CreepTrait from "./creep_traits";
import Economy from "./economy";
import EconomyUtils from "./economy_utils";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import EmergencySpawnStrategy from "./spawn_strategy.emergency";
import NotSpawnStrategy from "./spawn_strategy.not";
import OrChainSpawnStrategy from "./spawn_strategy.or_chain";
import RoleCountStrategy from "./spawn_strategy.role_count";
import Utils from "./utils";

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_LINK,
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_SPAWN,
];

export default class UpgraderRole extends BaseCreepRole {
    public run(creep: Creep): void {
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
            CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, SOURCE_STRUCTURES, Utils.getBodyCost(BASE_WORKER_CREEP_BODY) + 50));
        }
    }

    public isPrioritySpawn(spawn: StructureSpawn): boolean {
        return Utils.findCreepsByRole(this, spawn.room).length === 0;
    }

    public getSpawnStrategy(): SpawnStrategy {
        const that = this;
        return new AndChainSpawnStrategy([
            RoleCountStrategy.room(UPGRADERS_COUNT_LIMIT, this),
            new OrChainSpawnStrategy([
                new NotSpawnStrategy(
                    new EmergencySpawnStrategy((spawn) => Economy.isHarvesterEmergency(spawn.room))
                ),
                RoleCountStrategy.room(1, this),
            ]),
            {
                shouldSpawn(spawn: StructureSpawn): boolean {
                    const current = that.getCurrentWork(spawn);

                    if (EconomyUtils.usableSpawnEnergyRatio(spawn.room) < 0.05) {
                        return current < MAX_WORK_PER_CONTROLLER_EMERGENCY;
                    }

                    if (EconomyUtils.usableSpawnEnergyAvailable(spawn.room) > 400000) {
                        return current < AGGRESSIVE_UPGRADING_WORK;
                    }

                    return current < MAX_WORK_PER_CONTROLLER;
                }
            }
        ]);
    }

    public getCurrentWork(spawn: StructureSpawn) {
        const creeps = Utils.findCreepsByRole(this, spawn.room);
        return creeps
            .map(creep => Utils.countCreepBodyParts(creep, WORK))
            .reduce((p, v) => p + v, 0);
    }

    public getRoleName(): string {
        return 'upgrader';
    }

    protected getBody(spawn: StructureSpawn): BodyPartConstant[] {
        const upgraderBodies = WORKER_BODIES.filter(body => body.filter(part => part === WORK).length <= this.getMaxWorkPerBody(spawn));

        if (this.isPrioritySpawn(spawn)) {
            return Utils.getBiggerPossibleBodyNow(upgraderBodies, BASE_WORKER_CREEP_BODY, spawn);
        }

        return Utils.getBiggerPossibleBody(upgraderBodies, BASE_WORKER_CREEP_BODY, spawn);
    }

    private getMaxWorkPerBody(spawn: StructureSpawn): number {
        if (spawn.room.controller.level === 8) {
            return 1;
        }

        const current = this.getCurrentWork(spawn);

        if (EconomyUtils.usableSpawnEnergyRatio(spawn.room) < 0.05) {
            return Math.max(0, MAX_WORK_PER_CONTROLLER_EMERGENCY - current);
        }

        if (EconomyUtils.usableSpawnEnergyAvailable(spawn.room) > 400000) {
            return Math.max(0, AGGRESSIVE_UPGRADING_WORK - current);
        }

        return Math.max(0, MAX_WORK_PER_CONTROLLER - current);
    }
}
