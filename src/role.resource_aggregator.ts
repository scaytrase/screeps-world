import {BASE_CARRIER_CREEP_BODY} from "./config";
import CreepTrait from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils, {SORT} from "./utils";

const SOURCE_TYPES = [
    STRUCTURE_CONTAINER,
];

const FORBIDDEN_RESOURCES: string[] = [
    RESOURCE_KEANIUM,
    RESOURCE_ENERGY,
];

const filter = (structure: StructureContainer | StructureSpawn) =>
    structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_SPAWN
    && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;

export default class ResourceAggregator extends BaseCreepRole {
    private static getTargetStructure(creep: Creep): StructureContainer | null {
        const spawn = creep.room.find(FIND_MY_SPAWNS).shift();

        return creep.room.find<StructureContainer>(FIND_STRUCTURES, {filter: filter}).sort(Utils.sortByDistance(spawn)).shift();
    }

    private static getSourceStructures(creep: Creep): StructureContainer | null {
        const spawn = creep.room.find(FIND_MY_SPAWNS).shift();

        return creep.room.find<StructureContainer>(FIND_STRUCTURES, {filter: filter}).sort(Utils.sortByDistance(spawn, SORT.DESC)).shift();
    }

    run(creep: Creep, game: Game): void {
        const source = ResourceAggregator.getSourceStructures(creep);
        if (source && creep.store.getFreeCapacity() > 0) {
            CreepTrait.withdrawAllResources(creep, source);
        } else {
            CreepTrait.transferAllResources(creep, ResourceAggregator.getTargetStructure(creep));
        }
    }

    getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy(
            [
                new FoundMoreThanLimitSpawnStrategy(0, FIND_STRUCTURES, {filter: filter}),
                new LimitedSpawnByRoleCountStrategy(0, this)
            ]
        );
    }

    protected getBody(game: Game) {
        return BASE_CARRIER_CREEP_BODY;
    }

    protected getRoleName(): string {
        return 'resource_aggregator';
    }
}
