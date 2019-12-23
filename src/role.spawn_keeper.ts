import {BASE_WORKER_CREEP_BODY, HARVESTER_BODY, SPAWN_KEEPER_BODY, SPAWN_KEEPERS_COUNT_LIMIT} from "./config";
import CreepTrait from "./creep_traits";
import EnergyAggregatorRole from "./role.energy_aggregator";
import WorkRestCycleCreepRole from "./role.work_rest_cycle_creep";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_LINK,
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
];

const PRIORITY_TARGET_STRUCTURES: StructureConstant[] = [
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
];

const TARGET_STRUCTURES: StructureConstant[] = [
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
    STRUCTURE_TOWER,
];

export default class SpawnKeeperRole extends WorkRestCycleCreepRole<StructureSpawn | StructureExtension | StructureTower> {
    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(SPAWN_KEEPERS_COUNT_LIMIT, this);
    }

    protected getRoleName(): string {
        return 'spawn_keeper';
    }

    protected getBody(game: Game, spawn: StructureSpawn): BodyPartConstant[] {
        if (spawn.room.energyAvailable < 500 && Utils.findCreepsByRole(game, this).length === 0) {
            return BASE_WORKER_CREEP_BODY;
        }

        return SPAWN_KEEPER_BODY;
    }

    protected getTarget(creep: Creep, game: Game): StructureSpawn | StructureExtension | StructureTower {
        const target = Utils.getClosestEnergyRecipient<StructureSpawn | StructureExtension | StructureTower>(creep, PRIORITY_TARGET_STRUCTURES);
        if (target) {
            return target;
        }

        return Utils.getClosestEnergyRecipient(creep, TARGET_STRUCTURES);
    }

    protected rest(creep: Creep, game: Game): void {
        const energySource = Utils.getClosestEnergySource(creep, SOURCE_STRUCTURES);

        if (energySource && energySource.pos.getRangeTo(creep.pos) < 15) {
            CreepTrait.withdrawAllEnergy(creep, energySource);
        }
    }

    protected shouldRenewTarget(creep: Creep, game: Game): boolean {
        const target = this.getCurrentStructureTarget(creep);

        if (!target) {
            return true;
        }

        return target.store.getFreeCapacity(RESOURCE_ENERGY) === 0;
    }

    protected shouldRest(creep: Creep, game: Game): boolean {
        return creep.store.getUsedCapacity() == 0;
    }

    protected shouldWork(creep: Creep, game: Game): boolean {
        return creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0;
    }

    protected work(creep: Creep, game: Game): void {
        CreepTrait.transferAllEnergy(creep, this.getCurrentStructureTarget(creep));
    }
}
