import {BASE_WORKER_CREEP_BODY, WORKER_BODIES} from "./const";
import CreepTrait from "./creep_traits";
import WorkRestCycleCreepRole from "./role.work_rest_cycle_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import NotEmptyCallableResult from "./spawn_strategy.not_empty_callable_result";
import Utils from "./utils";

export default class RemoteUpgraderRole extends WorkRestCycleCreepRole<StructureController> {
    public getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy([
            new LimitedSpawnByRoleCountStrategy(4, this, () => 1, true),
            new NotEmptyCallableResult((game, spawn) => this
                .getControllers(game)
                .filter(controller => controller.room.name !== spawn.room.name)
                .shift()
            ),
            new NotEmptyCallableResult((game, spawn) => spawn.room.storage && spawn.room.storage.store.getUsedCapacity() > 50000),
        ]);
    }

    protected isSpawnBound(): boolean {
        return false;
    }

    protected shouldWork(creep: Creep, game: Game): boolean {
        return creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0;
    }

    protected shouldRest(creep: Creep, game: Game): boolean {
        return creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
    }

    protected work(creep: Creep, game: Game): void {
        CreepTrait.upgradeController(creep, this.getCurrentStructureTarget(creep));
    }

    protected rest(creep: Creep, game: Game): void {
        const source = Utils.getClosestEnergySource(creep, [STRUCTURE_STORAGE, STRUCTURE_CONTAINER]);
        const closestEnergyMine = Utils.getClosestEnergyMine(creep);

        if (creep.pos.getRangeTo(source) < creep.pos.getRangeTo(closestEnergyMine)) {
            CreepTrait.withdrawAllEnergy(creep, source);
        } else {
            CreepTrait.harvest(creep, closestEnergyMine);
        }
    }

    protected shouldRenewTarget(creep: Creep, game: Game): boolean {
        return false;
    }

    protected getTarget(creep: Creep, game: Game): StructureController {
        return this.getControllers(game).sort(Utils.sortByDistance(creep)).shift();
    }

    protected getBody(game: Game, spawn: StructureSpawn): BodyPartConstant[] {
        return Utils.getBiggerPossibleBodyNow(WORKER_BODIES, BASE_WORKER_CREEP_BODY, spawn);
    }

    protected getRoleName(): string {
        return 'remote_upgrader';
    }

    private getControllers(game: Game): StructureController[] {
        let controllers = [];
        for (const roomName in game.rooms) {
            const room = game.rooms[roomName];

            if (room.find(FIND_MY_SPAWNS).length === 0 || room.controller.level < 3) {
                controllers.push(room.controller);
            }
        }

        return controllers;
    }
}
