import {ENERGY_AGGREGATOR_ADVANCED_BODY} from "./config";
import CreepTrait from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const _ = require('lodash');

const SOURCE_TYPES = [
    STRUCTURE_CONTAINER
];

const filter = (structure) => SOURCE_TYPES.includes(structure.structureType) && structure['store'].getUsedCapacity() > structure['store'].getUsedCapacity(RESOURCE_ENERGY);

export default class ResourceCarrier extends BaseCreepRole {
    private static getRecipientStructure(creep: Creep): StructureStorage | null {
        return creep.room.storage;
    }

    private static getSourceStructures(creep: Creep): StructureContainer[] | null {
        return creep.room.find<StructureContainer>(FIND_STRUCTURES, {filter: filter}).sort(Utils.sortByDistance(creep));
    }

    run(creep: Creep, game: Game): void {
        if (creep['store'].getFreeCapacity() > 0) {
            CreepTrait.withdrawAllResources(creep, ResourceCarrier.getSourceStructures(creep).shift());
        } else {
            CreepTrait.transferAllResources(creep, ResourceCarrier.getRecipientStructure(creep));
        }
    }

    getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy(
            [
                new FoundMoreThanLimitSpawnStrategy(0, FIND_STRUCTURES, {filter: filter}),
                new LimitedSpawnByRoleCountStrategy(1, this)
            ]
        );
    }

    protected getBody(game: Game) {
        return ENERGY_AGGREGATOR_ADVANCED_BODY;
    }

    protected getRoleName(): string {
        return 'resource_carrier';
    }
}
