import {RESOURCE_AGGREGATOR_BODY, RESOURCE_AGGREGATORS_COUNT_LIMIT} from "./config";
import CreepTrait from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils, {SORT} from "./utils";

const filter = (structure: StructureContainer) =>
    structure.structureType === STRUCTURE_CONTAINER
    && structure.store.getUsedCapacity() > 0
    && structure.store.getUsedCapacity(RESOURCE_ENERGY) !== structure.store.getUsedCapacity(RESOURCE_ENERGY);

export default class ResourceAggregator extends BaseCreepRole {
    private static getRecipient(creep: Creep): StructureStorage | null {
        return creep.room.storage;
    }

    private static getSource(creep: Creep): StructureContainer | null {
        const spawn = creep.room.find(FIND_MY_SPAWNS).shift();

        return creep.room.find<StructureContainer>(FIND_STRUCTURES, {filter: filter}).sort(Utils.sortByDistance(spawn, SORT.DESC)).shift();
    }

    run(creep: Creep, game: Game): void {
        const source = ResourceAggregator.getSource(creep);
        if (source && creep.store.getFreeCapacity() > 0) {
            CreepTrait.withdrawAllResources(creep, source);
        } else {
            CreepTrait.transferAllResources(creep, ResourceAggregator.getRecipient(creep));
        }
    }

    getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy(
            [
                new FoundMoreThanLimitSpawnStrategy(0, FIND_STRUCTURES, {filter: filter}),
                new FoundMoreThanLimitSpawnStrategy(0, FIND_STRUCTURES, {filter: {structureType: STRUCTURE_STORAGE}}),
                new LimitedSpawnByRoleCountStrategy(RESOURCE_AGGREGATORS_COUNT_LIMIT, this)
            ]
        );
    }

    protected getBody(game: Game) {
        return RESOURCE_AGGREGATOR_BODY;
    }

    protected getRoleName(): string {
        return 'resource_aggregator';
    }
}
