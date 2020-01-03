import {BASE_CARRIER_CREEP_BODY, CARRIER_BODIES, ENERGY_AGGREGATORS_COUNT_LIMIT} from "./config";
import CreepTrait from "./creep_traits";
import WorkRestCycleCreepRole from "./role.work_rest_cycle_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import OrChainSpawnStrategy from "./spawn_strategy.or_chain";
import Utils, {SORT} from "./utils";

const ROLE_ENERGY_AGGREGATOR = 'energy_aggregator';

const recipientFilter = (structure: StructureContainer | StructureSpawn) =>
    structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_SPAWN
    && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;

const sourceFilter = (structure: StructureContainer) =>
    structure.structureType === STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;

export default class EnergyAggregatorRole extends WorkRestCycleCreepRole<StructureContainer | StructureLink> {
    private static getRecipient(creep: Creep): StructureContainer | StructureStorage | null {
        if (creep.room.storage) {
            return creep.room.storage;
        }

        const spawn = creep.room.find(FIND_MY_SPAWNS).shift();

        return creep.room.find<StructureContainer>(FIND_STRUCTURES, {filter: recipientFilter}).sort(Utils.sortByDistance(spawn)).shift();
    }

    public isPrioritySpawn(spawn: StructureSpawn, game: Game): boolean {
        return Utils.findCreepsByRole(game, this, spawn.room).length === 0;
    }

    public getSpawnStrategy(): SpawnStrategy {
        const filter = capacity => (structure: StructureContainer) => structure.structureType === STRUCTURE_CONTAINER && structure.store.getUsedCapacity() > capacity;
        return new OrChainSpawnStrategy([
            new AndChainSpawnStrategy([
                new LimitedSpawnByRoleCountStrategy(ENERGY_AGGREGATORS_COUNT_LIMIT, this),
                new FoundMoreThanLimitSpawnStrategy(0, FIND_STRUCTURES, {filter: filter(500)}),
            ]),
            new AndChainSpawnStrategy([
                new FoundMoreThanLimitSpawnStrategy(0, FIND_STRUCTURES, {filter: {structureType: STRUCTURE_STORAGE}}),
                new FoundMoreThanLimitSpawnStrategy(0, FIND_STRUCTURES, {filter: filter(1000)}),
                new LimitedSpawnByRoleCountStrategy(3, this),
            ])
        ]);
    }

    protected shouldRenewTarget(creep: Creep, game: Game): boolean {
        const target = this.getCurrentStructureTarget(creep);
        if (!target) {
            return true;
        }

        // @ts-ignore
        return target.store.getUsedCapacity(RESOURCE_ENERGY) === 0;
    }

    protected getTarget(creep: Creep, game: Game): StructureContainer | StructureLink {
        const spawn = creep.room.find(FIND_MY_SPAWNS).shift();

        return creep.room.find<StructureContainer>(FIND_STRUCTURES, {filter: sourceFilter}).sort(Utils.sortByDistance(spawn, SORT.DESC)).shift();
    }

    protected getBody(game: Game, spawn: StructureSpawn): BodyPartConstant[] {
        if (this.isPrioritySpawn(spawn, game)) {
            return Utils.getBiggerPossibleBodyNow(CARRIER_BODIES, BASE_CARRIER_CREEP_BODY, spawn);
        }

        return Utils.getBiggerPossibleBody(CARRIER_BODIES, BASE_CARRIER_CREEP_BODY, spawn);
    }

    protected getRoleName(): string {
        return ROLE_ENERGY_AGGREGATOR;
    }

    protected rest(creep: Creep, game: Game): void {
        CreepTrait.transferAllResources(creep, EnergyAggregatorRole.getRecipient(creep));
    }

    protected shouldRest(creep: Creep, game: Game): boolean {
        return !this.getCurrentStructureTarget(creep) || creep.store.getFreeCapacity() === 0;
    }

    protected shouldWork(creep: Creep, game: Game): boolean {
        return this.getCurrentStructureTarget(creep) && creep.store.getUsedCapacity() === 0;
    }

    protected work(creep: Creep, game: Game): void {
        const target = this.getCurrentStructureTarget(creep);
        if (target) {
            CreepTrait.withdrawAllResources(creep, target);
        } else {
            CreepTrait.goToParking(creep, game);
        }
    }
}
