import {
    MIN_ECONOMY_FOR_REMOTE_CREEP_PRODUCERS,
    REMOTE_UPGRADERS_COUNT_LIMIT,
    UPGRADE_REMOTE_ROOMS_UP_TO_LEVEL
} from "./config";
import {BASE_WORKER_CREEP_BODY, WORKER_BODIES} from "./const";
import CreepTrait from "./creep_traits";
import WorkRestCycleCreepRole from "./role.work_rest_cycle_creep";
import {Sort} from "./sort_utils";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import NotEmptyCallableResult from "./spawn_strategy.not_empty_callable_result";
import RoleCountStrategy from "./spawn_strategy.role_count";
import Utils from "./utils";

export default class RemoteUpgraderRole extends WorkRestCycleCreepRole<StructureController> {
    public getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy([
            RoleCountStrategy.global(REMOTE_UPGRADERS_COUNT_LIMIT, this),
            new NotEmptyCallableResult((spawn) => this
                .getControllers()
                .filter(controller => controller.room.name !== spawn.room.name)
                .shift()
            ),
            new NotEmptyCallableResult((spawn) => spawn.room.storage && spawn.room.storage.store.getUsedCapacity() > MIN_ECONOMY_FOR_REMOTE_CREEP_PRODUCERS),
        ]);
    }

    public getRoleName(): string {
        return 'remote_upgrader';
    }

    protected isSpawnBound(): boolean {
        return false;
    }

    protected shouldWork(creep: Creep): boolean {
        return creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0;
    }

    protected shouldRest(creep: Creep): boolean {
        return creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
    }

    protected work(creep: Creep): void {
        CreepTrait.upgradeController(creep, this.getCurrentStructureTarget(creep));
    }

    protected rest(creep: Creep): void {
        const enemySource: Structure = creep.room.find(FIND_HOSTILE_STRUCTURES, {
            filter: (structure: StructureSpawn | StructureStorage | StructureContainer | StructureTower | StructureLink) =>
                ((structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE || structure.structureType === STRUCTURE_TOWER || structure.structureType === STRUCTURE_LINK)
                    // @ts-ignore
                    && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
        }).sort(Sort.byDistance(creep)).shift();
        const source = Utils.getClosestEnergySource(creep, [STRUCTURE_STORAGE, STRUCTURE_CONTAINER]);
        const closestEnergyMine = Utils.getClosestEnergyMine(creep);
        const grave = Utils.getRoomGraves(creep.room).sort(Sort.byDistance(creep)).shift();

        if (enemySource) {
            CreepTrait.withdrawAllEnergy(creep, enemySource);
        } else if (creep.pos.getRangeTo(source) < creep.pos.getRangeTo(closestEnergyMine)) {
            CreepTrait.withdrawAllEnergy(creep, source);
        } else if (creep.pos.getRangeTo(grave) < creep.pos.getRangeTo(closestEnergyMine)) {
            CreepTrait.pickupAllResources(creep, grave);
        } else {
            CreepTrait.harvest(creep, closestEnergyMine);
        }
    }

    protected shouldRenewTarget(creep: Creep): boolean {
        return false;
    }

    protected getTarget(creep: Creep): StructureController {
        return this.getControllers().sort(Sort.byDistance(creep)).shift();
    }

    protected getBody(spawn: StructureSpawn): BodyPartConstant[] {
        return Utils.getBiggerPossibleBodyNow(WORKER_BODIES, BASE_WORKER_CREEP_BODY, spawn);
    }

    private getControllers(): StructureController[] {
        let controllers = [];
        for (const roomName in Game.rooms) {
            const room = Game.rooms[roomName];

            if (!room.controller.my) {
                continue;
            }

            if (room.find(FIND_MY_SPAWNS).length === 0 || room.controller.level < UPGRADE_REMOTE_ROOMS_UP_TO_LEVEL) {
                controllers.push(room.controller);
            }
        }

        return controllers;
    }
}
