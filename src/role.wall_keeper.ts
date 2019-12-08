import {WALL_DESIRED_HITS_HIGH, WALL_DESIRED_HITS_LOW, WALL_KEEPER_BODY, WALL_KEEPERS_COUNT_LIMIT} from "./config";
import CreepTrait from "./creep_traits";
import WorkRestCycleCreepRole from "./role.work_rest_cycle_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const TARGET_STRUCTURES: StructureConstant[] = [
    STRUCTURE_WALL,
    STRUCTURE_RAMPART,
];

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
];

const repairFilter = (object: AnyStructure) => TARGET_STRUCTURES.includes(object.structureType) && object.hits < WALL_DESIRED_HITS_LOW;

export default class WallKeeperRole extends WorkRestCycleCreepRole<StructureWall | StructureRampart> {
    public getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy(
            [
                new FoundMoreThanLimitSpawnStrategy(0, FIND_STRUCTURES, {filter: repairFilter}),
                new LimitedSpawnByRoleCountStrategy(WALL_KEEPERS_COUNT_LIMIT, this),
            ]
        );
    }

    protected shouldWork(creep: Creep, game: Game): boolean {
        return creep.store.getFreeCapacity() === 0;
    }

    protected shouldRest(creep: Creep, game: Game): boolean {
        return creep.store.getUsedCapacity() === 0;
    }

    protected work(creep: Creep, game: Game): void {
        CreepTrait.build(creep, this.getCurrentStructureTarget(creep));
    }

    protected rest(creep: Creep, game: Game): void {
        CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, SOURCE_STRUCTURES, creep.store.getCapacity()));
    }

    protected shouldRenewTarget(creep: Creep, game: Game): boolean {
        const current = this.getCurrentStructureTarget(creep);

        if (!current) {
            return undefined;
        }

        return current.hits > WALL_DESIRED_HITS_HIGH;
    }

    protected getRoleName(): string {
        return 'wall_keeper';
    }

    protected getBody(game: Game) {
        return WALL_KEEPER_BODY;
    }

    protected getTarget(creep: Creep, game: Game): StructureWall | StructureRampart | null {
        return creep.room.find<StructureWall | StructureRampart>(FIND_STRUCTURES, {filter: repairFilter}).sort(Utils.sortByHealthPercent()).shift();
    }
}
