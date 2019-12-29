import {BASE_CARRIER_CREEP_BODY, SPAWN_KEEPER_BODY, SPAWN_KEEPERS_COUNT_LIMIT} from "./config";
import CreepTrait from "./creep_traits";
import WorkRestCycleCreepRole from "./role.work_rest_cycle_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";
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
    public getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy(
            [
                new LimitedSpawnByRoleCountStrategy(SPAWN_KEEPERS_COUNT_LIMIT, this),
                new FoundMoreThanLimitSpawnStrategy(0, FIND_STRUCTURES, {
                    filter: (structure) =>
                        structure.structureType === STRUCTURE_CONTAINER ||
                        structure.structureType === STRUCTURE_STORAGE ||
                        structure.structureType === STRUCTURE_LINK
                })
            ]
        );
    }

    public isPrioritySpawn(spawn: StructureSpawn, game: Game): boolean {
        return Utils.findCreepsByRole(game, this, spawn.room).length === 0;
    }

    protected getRoleName(): string {
        return 'spawn_keeper';
    }

    protected getBody(game: Game, spawn: StructureSpawn): BodyPartConstant[] {
        if (!Utils.isCapableToSpawnBodyNow(spawn, SPAWN_KEEPER_BODY) && Utils.findCreepsByRole(game, this, spawn.room).length === 0) {
            return BASE_CARRIER_CREEP_BODY;
        }

        return SPAWN_KEEPER_BODY;
    }

    protected getTarget(creep: Creep, game: Game): StructureSpawn | StructureExtension | StructureTower {
        const target = Utils.getClosestEnergyRecipient<StructureSpawn | StructureExtension>(creep, PRIORITY_TARGET_STRUCTURES);
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

        this.renewTarget(creep, game);
    }

    protected shouldRenewTarget(creep: Creep, game: Game): boolean {
        const target = this.getCurrentStructureTarget(creep);

        if (!target) {
            return true;
        }

        if (!target.store) {
            console.log(target);

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
