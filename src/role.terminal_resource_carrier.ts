import {TERMINAL_ENERGY_REQUIREMENT, TERMINAL_RESOURCE_CARRIERS_COUNT_LIMIT} from "./config";
import {BASE_CARRIER_CREEP_BODY, CARRIER_BODIES} from "./const";
import CreepTrait from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import {Sort} from "./sort_utils";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import RoleCountStrategy from "./spawn_strategy.role_count";
import RoomFindSpawnStrategy from "./spawn_strategy.room_find";
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
        return creep.room.find<StructureContainer>(FIND_STRUCTURES, {filter: this.filterStructure()}).sort(Sort.byDistance(creep)).shift();
    }

    run(creep: Creep): void {
        const terminal = creep.room.terminal;
        if (terminal && terminal.store.getUsedCapacity(RESOURCE_ENERGY) < TERMINAL_ENERGY_REQUIREMENT) {
            const source = Utils.getClosestEnergySource(creep, [STRUCTURE_STORAGE, STRUCTURE_CONTAINER], 1000);
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
                new RoomFindSpawnStrategy(FIND_STRUCTURES, {filter: TerminalResourceCarrier.filterStructure()}),
                new RoomFindSpawnStrategy(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_TERMINAL}}),
                RoleCountStrategy.room(TERMINAL_RESOURCE_CARRIERS_COUNT_LIMIT, this)
            ]
        );
    }

    public getRoleName(): string {
        return 'terminal_resource_carrier';
    }

    protected getBody(spawn: StructureSpawn) {
        const bodies = CARRIER_BODIES.filter(body => body.filter(part => part === CARRY).length <= 8);

        return Utils.getBiggerPossibleBodyNow(bodies, BASE_CARRIER_CREEP_BODY, spawn);
    }
}
