import {BASE_WORKER_CREEP_BODY, BUILDER_BODY} from "./config";
import CreepTrait from "./creep_traits";
import WorkRestCycleCreepRole from "./role.work_rest_cycle_creep";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

export default class RemoteUpgraderRole extends WorkRestCycleCreepRole<StructureController> {
    public getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(1, this);
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
        let controllers = [];
        for (const roomName in game.rooms) {
            const room = game.rooms[roomName];

            if (room.find(FIND_MY_SPAWNS).length === 0) {
                controllers.push(room.controller);
            }
        }

        return controllers.sort(Utils.sortByDistance(creep)).shift();
    }

    protected getBody(game: Game, spawn: StructureSpawn): BodyPartConstant[] {
        if (!Utils.isCapableToSpawnBody(spawn, BUILDER_BODY)) {
            return BASE_WORKER_CREEP_BODY;
        }

        return BUILDER_BODY;
    }

    protected getRoleName(): string {
        return 'remote_upgrader';
    }
}
