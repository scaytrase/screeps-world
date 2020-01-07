import {WALL_DESIRED_HITS_HIGH, WALL_DESIRED_HITS_LOW, WALL_KEEPERS_COUNT_LIMIT} from "./config";
import {BASE_WORKER_CREEP_BODY, WORKER_BODIES} from "./const";
import CreepTrait from "./creep_traits";
import WorkRestCycleCreepRole from "./role.work_rest_cycle_creep";
import {Sort} from "./sort_utils";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import RoleCountStrategy from "./spawn_strategy.role_count";
import RoomFindSpawnStrategy from "./spawn_strategy.room_find";
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
                new RoomFindSpawnStrategy(FIND_STRUCTURES, {filter: repairFilter}),
                RoleCountStrategy.room(WALL_KEEPERS_COUNT_LIMIT, this),
            ]
        );
    }

    public getRoleName(): string {
        return 'wall_keeper';
    }

    protected shouldWork(creep: Creep): boolean {
        return creep.store.getFreeCapacity() === 0;
    }

    protected shouldRest(creep: Creep): boolean {
        return creep.store.getUsedCapacity() === 0;
    }

    protected work(creep: Creep): void {
        CreepTrait.build(creep, this.getCurrentStructureTarget(creep));
    }

    protected rest(creep: Creep): void {
        CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, SOURCE_STRUCTURES, creep.store.getCapacity()));
    }

    protected shouldRenewTarget(creep: Creep): boolean {
        const current = this.getCurrentStructureTarget(creep);

        if (!current) {
            return undefined;
        }

        return current.hits > WALL_DESIRED_HITS_HIGH;
    }

    protected getBody(spawn: StructureSpawn) {
        return Utils.getBiggerPossibleBodyNow(WORKER_BODIES, BASE_WORKER_CREEP_BODY, spawn);
    }

    protected getTarget(creep: Creep): StructureWall | StructureRampart | null {
        return creep.room.find<StructureWall | StructureRampart>(FIND_STRUCTURES, {filter: repairFilter}).sort(Sort.byHealthPercent()).shift();
    }
}
