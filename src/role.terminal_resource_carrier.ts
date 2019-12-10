import {CARRIER_CREEP_BODY_LVL2} from "./config";
import CreepTrait from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const SOURCE_TYPES = [
    STRUCTURE_CONTAINER,
    STRUCTURE_STORAGE
];

const RESOURCES: ResourceConstant[] = [
    RESOURCE_KEANIUM,
];

const filter = (structure) =>
        SOURCE_TYPES.includes(structure.structureType)
        && RESOURCES.map(type => structure.store.getUsedCapacity(type) > 0).reduce((pr, v) => pr || v, false);

export default class TerminalResourceCarrier extends BaseCreepRole {
    private static getRecipientStructure(creep: Creep): StructureTerminal | null {
        return creep.room.terminal;
    }

    private static getCurrentResource(creep: Creep, store: StructureStorage | StructureContainer ): ResourceConstant {
        return RESOURCES.filter(type => store.store.getUsedCapacity(type) > 0).shift();
    }

    private static getSourceStructures(creep: Creep): StructureContainer[] | null {
        return creep.room.find<StructureContainer>(FIND_STRUCTURES, {filter: filter}).sort(Utils.sortByDistance(creep));
    }

    run(creep: Creep, game: Game): void {
        const source = TerminalResourceCarrier.getSourceStructures(creep).shift();
        if (source && creep.store.getFreeCapacity() > 0) {
            CreepTrait.withdrawResource(creep, source, TerminalResourceCarrier.getCurrentResource(creep, source));
        } else {
            CreepTrait.transferAllResources(creep, TerminalResourceCarrier.getRecipientStructure(creep));
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
        return CARRIER_CREEP_BODY_LVL2;
    }

    protected getRoleName(): string {
        return 'terminal_resource_carrier';
    }
}
