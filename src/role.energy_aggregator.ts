import {ENERGY_AGGREGATORS_COUNT_LIMIT} from "./config";
import {BASE_CARRIER_CREEP_BODY, CARRIER_BODIES} from "./const";
import CreepTrait from "./creep_traits";
import WorkRestCycleCreepRole from "./role.work_rest_cycle_creep";
import {Sort} from "./sort_utils";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import OrChainSpawnStrategy from "./spawn_strategy.or_chain";
import RoleCountStrategy from "./spawn_strategy.role_count";
import RoomFindSpawnStrategy from "./spawn_strategy.room_find";
import Utils from "./utils";

const ROLE_ENERGY_AGGREGATOR = 'energy_aggregator';

const recipientFilter = (structure: StructureContainer | StructureStorage | StructureTower | StructureLink | StructureSpawn) =>
    structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_SPAWN
    && structure.my && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;

const sourceFilter = (structure: StructureContainer) =>
    structure.structureType === STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;

export default class EnergyAggregatorRole extends WorkRestCycleCreepRole<StructureContainer | StructureStorage | StructureTower | StructureLink> {
    private static getRecipient(creep: Creep): StructureContainer | StructureStorage | null {
        if (creep.room.storage && creep.room.storage.my) {
            return creep.room.storage;
        }

        const spawn = creep.room.find(FIND_MY_SPAWNS).shift();

        return creep.room.find<StructureContainer>(FIND_STRUCTURES, {filter: recipientFilter}).sort(Sort.byDistance(spawn)).shift();
    }

    public isPrioritySpawn(spawn: StructureSpawn): boolean {
        return Utils.findCreepsByRole(this, spawn.room).length === 0;
    }

    public getSpawnStrategy(): SpawnStrategy {
        const filter = capacity => (structure: StructureContainer | StructureStorage) =>
            (structure.structureType === STRUCTURE_CONTAINER && structure.store.getUsedCapacity() > capacity)
            || (structure.structureType === STRUCTURE_STORAGE && !structure.my && structure.store.getUsedCapacity() > 0);
        return new OrChainSpawnStrategy([
            new AndChainSpawnStrategy([
                RoleCountStrategy.room(ENERGY_AGGREGATORS_COUNT_LIMIT, this),
                new RoomFindSpawnStrategy(FIND_STRUCTURES, {filter: filter(500)}),
            ]),
            new AndChainSpawnStrategy([
                new RoomFindSpawnStrategy(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_STORAGE}}),
                new RoomFindSpawnStrategy(FIND_STRUCTURES, {filter: filter(1000)}),
                RoleCountStrategy.room(3, this),
            ])
        ]);
    }

    public getRoleName(): string {
        return ROLE_ENERGY_AGGREGATOR;
    }

    protected shouldRenewTarget(creep: Creep): boolean {
        const target = this.getCurrentStructureTarget(creep);
        if (!target) {
            return true;
        }

        // @ts-ignore
        return target.store.getUsedCapacity(RESOURCE_ENERGY) === 0;
    }

    protected getTarget(creep: Creep): StructureContainer | StructureStorage | StructureTower | StructureLink {
        const enemySource: StructureStorage | StructureTower | StructureContainer | StructureLink =
            creep.room
                .find<StructureStorage | StructureTower | StructureContainer | StructureLink>(FIND_HOSTILE_STRUCTURES, {
                    filter: (structure: StructureStorage | StructureTower | StructureContainer | StructureLink) =>
                        ((structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE || structure.structureType === STRUCTURE_TOWER || structure.structureType === STRUCTURE_LINK)
                            // @ts-ignore
                            && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
                }).sort(Sort.byDistance(creep)).shift();
        if (enemySource) {
            return enemySource;
        }

        const spawn = creep.room.find(FIND_MY_SPAWNS).shift();

        return creep.room.find<StructureContainer>(FIND_STRUCTURES, {filter: sourceFilter}).sort(Sort.byDistance(spawn)).shift();
    }

    protected getBody(spawn: StructureSpawn): BodyPartConstant[] {
        const bodies = CARRIER_BODIES.filter(body => body.filter(part => part === CARRY).length <= 10);

        if (this.isPrioritySpawn(spawn)) {
            return Utils.getBiggerPossibleBodyNow(bodies, BASE_CARRIER_CREEP_BODY, spawn);
        }

        return Utils.getBiggerPossibleBody(bodies, BASE_CARRIER_CREEP_BODY, spawn);
    }

    protected rest(creep: Creep): void {
        CreepTrait.transferAllResources(creep, EnergyAggregatorRole.getRecipient(creep));
    }

    protected shouldRest(creep: Creep): boolean {
        return !this.getCurrentStructureTarget(creep) || creep.store.getFreeCapacity() === 0;
    }

    protected shouldWork(creep: Creep): boolean {
        return this.getCurrentStructureTarget(creep) && creep.store.getUsedCapacity() === 0;
    }

    protected work(creep: Creep): void {
        CreepTrait.withdrawAllResources(creep, this.getCurrentStructureTarget(creep));
    }
}
