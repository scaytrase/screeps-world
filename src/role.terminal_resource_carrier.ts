import {
    BASE_CARRIER_CREEP_BODY,
    CARRIER_CREEP_BODY_LVL3,
    TERMINAL_ENERGY_REQUIREMENT,
    TERMINAL_RESOURCE_CARRIERS_COUNT_LIMIT
} from "./config";
import CreepTrait from "./creep_traits";
import Economy, {ECONOMY_LEVEL} from "./economy";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const SOURCE_TYPES: StructureConstant[] = [
    STRUCTURE_CONTAINER,
    STRUCTURE_STORAGE
];

const FORBIDDEN_RESOURCES: ResourceConstant[] = [
    RESOURCE_ENERGY
];

export default class TerminalResourceCarrier extends BaseCreepRole {
    private static getCurrentResource(store: StructureStorage | StructureContainer): ResourceConstant {
        return Object.keys(store.store)
            .filter((type: ResourceConstant) => !FORBIDDEN_RESOURCES.includes(type))
            .filter((type: ResourceConstant) => store.store.getUsedCapacity(type) > 0)
            .map(type => <ResourceConstant>type)
            .shift()
            ;
    }

    private static filterStructure(): (structure: Structure) => boolean {
        return (structure: StructureStorage | StructureContainer) =>
            SOURCE_TYPES.includes(structure.structureType)
            && TerminalResourceCarrier.getCurrentResource(structure) !== undefined;
    }

    private static getSourceStructure(creep: Creep): StructureContainer | StructureStorage | null {
        return creep.room.find<StructureContainer>(FIND_STRUCTURES, {filter: this.filterStructure()}).sort(Utils.sortByDistance(creep)).shift();
    }

    run(creep: Creep, game: Game): void {
        const terminal = creep.room.terminal;
        if (terminal.store.getUsedCapacity(RESOURCE_ENERGY) < TERMINAL_ENERGY_REQUIREMENT) {
            const source = Utils.getClosestEnergySource(creep, [STRUCTURE_STORAGE, STRUCTURE_CONTAINER]);
            if (source && creep.store.getFreeCapacity() > 0) {
                CreepTrait.withdrawAllEnergy(creep, source);
            } else {
                CreepTrait.transferAllEnergy(creep, terminal);
            }
        } else {
            const source = TerminalResourceCarrier.getSourceStructure(creep);
            if (source && creep.store.getFreeCapacity() > 0) {
                CreepTrait.withdrawResource(creep, source, TerminalResourceCarrier.getCurrentResource(source));
            } else {
                CreepTrait.transferAllResources(creep, terminal);
            }
        }
    }

    getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy(
            [
                new FoundMoreThanLimitSpawnStrategy(0, FIND_STRUCTURES, {filter: TerminalResourceCarrier.filterStructure()}),
                new LimitedSpawnByRoleCountStrategy(TERMINAL_RESOURCE_CARRIERS_COUNT_LIMIT, this)
            ]
        );
    }

    protected getBody(game: Game, spawn: StructureSpawn) {
        if (Utils.isCapableToSpawnBody(spawn, CARRIER_CREEP_BODY_LVL3) && Economy.getCurrentEconomyLevel(spawn.room, game) !== ECONOMY_LEVEL.LOW) {
            return CARRIER_CREEP_BODY_LVL3;
        }

        return BASE_CARRIER_CREEP_BODY;
    }

    protected getRoleName(): string {
        return 'terminal_resource_carrier';
    }
}
