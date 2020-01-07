import {RESOURCE_AGGREGATORS_COUNT_LIMIT} from "./config";
import {BASE_CARRIER_CREEP_BODY, CARRIER_BODIES} from "./const";
import CreepTrait from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import {Sort} from "./sort_utils";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import RoleCountStrategy from "./spawn_strategy.role_count";
import RoomFindSpawnStrategy from "./spawn_strategy.room_find";
import Utils from "./utils";

const filter = (structure: StructureContainer) =>
    structure.structureType === STRUCTURE_CONTAINER
    && structure.store.getUsedCapacity() > 0
    && structure.store.getUsedCapacity(RESOURCE_ENERGY) !== structure.store.getUsedCapacity();

export default class ResourceAggregator extends BaseCreepRole {
    private static getRecipient(creep: Creep): StructureStorage | null {
        return creep.room.storage;
    }

    private static getSource(creep: Creep): StructureContainer | null {
        const spawn = creep.room.find(FIND_MY_SPAWNS).shift();

        return creep.room.find<StructureContainer>(FIND_STRUCTURES, {filter: filter}).sort(Sort.byDistance(spawn)).shift();
    }

    run(creep: Creep): void {
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
                new RoomFindSpawnStrategy(FIND_STRUCTURES, {filter: filter}),
                new RoomFindSpawnStrategy(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_STORAGE}}),
                RoleCountStrategy.room(RESOURCE_AGGREGATORS_COUNT_LIMIT, this)
            ]
        );
    }

    public getRoleName(): string {
        return 'resource_aggregator';
    }

    protected getBody(spawn: StructureSpawn) {
        const bodies = CARRIER_BODIES.filter(body => body.filter(part => part === CARRY).length <= 5);

        if (this.isPrioritySpawn(spawn)) {
            return Utils.getBiggerPossibleBodyNow(bodies, BASE_CARRIER_CREEP_BODY, spawn);
        }

        return Utils.getBiggerPossibleBody(bodies, BASE_CARRIER_CREEP_BODY, spawn);
    }
}
