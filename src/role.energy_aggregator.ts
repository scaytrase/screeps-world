import {ENERGY_AGGREGATOR_BODY, ENERGY_AGGREGATORS_COUNT_LIMIT} from "./config";
import CreepTrait from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils, {SORT} from "./utils";

const ROLE_ENERGY_AGGREGATOR = 'energy_aggregator';

const filter = (structure: StructureContainer | StructureSpawn) =>
    structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_SPAWN
    && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;

export default class EnergyAggregatorRole extends BaseCreepRole {
    private static getTargetStructure(creep: Creep): StructureContainer | null {
        const spawn = creep.room.find(FIND_MY_SPAWNS).shift();

        return creep.room.find<StructureContainer>(FIND_STRUCTURES, {filter: filter}).sort(Utils.sortByDistance(spawn)).shift();
    }

    private static getSourceStructures(creep: Creep): StructureContainer | null {
        const spawn = creep.room.find(FIND_MY_SPAWNS).shift();

        return creep.room.find<StructureContainer>(FIND_STRUCTURES, {filter: filter}).sort(Utils.sortByDistance(spawn, SORT.DESC)).shift();
    }


    run(creep: Creep, game: Game): void {
        const source = EnergyAggregatorRole.getSourceStructures(creep);
        if (source && creep.store.getFreeCapacity() > 0) {
            CreepTrait.withdrawAllResources(creep, source);
        } else {
            CreepTrait.transferAllResources(creep, EnergyAggregatorRole.getTargetStructure(creep));
        }
    }

    public getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy([
            new LimitedSpawnByRoleCountStrategy(ENERGY_AGGREGATORS_COUNT_LIMIT, this),
        ]);
    }

    protected getBody(game: Game): BodyPartConstant[] {
        return ENERGY_AGGREGATOR_BODY;
    }

    protected getRoleName(): string {
        return ROLE_ENERGY_AGGREGATOR;
    }
}
