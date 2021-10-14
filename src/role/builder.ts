import {BUILDERS_COUNT_LIMIT, RAMPART_INITIAL_HITS} from "../config/config";
import {BASE_WORKER_CREEP_BODY, WORKER_BODIES} from "../config/const";
import CreepTrait from "../creep_traits";
import WorkRestCycleCreepRole from "../base_roles/work_rest_cycle_creep";
import {Sort} from "../utils/sort_utils";
import AndChainSpawnStrategy from "../spawn_strategy/and_chain";
import RoleCountStrategy from "../spawn_strategy/role_count";
import RoomFindSpawnStrategy from "../spawn_strategy/room_find";
import Utils from "../utils/utils";
import ProtoCreep from "../proto_creep";
import BodyFilter from "../utils/body_filter";

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_LINK,
    STRUCTURE_SPAWN,
    STRUCTURE_TERMINAL
];

export default class BuilderRole extends WorkRestCycleCreepRole<ConstructionSite | StructureRampart> {
    public getRoleName(): string {
        return 'builder';
    }

    protected shouldWork(creep: Creep): boolean {
        return creep.store.getFreeCapacity() == 0;
    }

    protected shouldRest(creep: Creep): boolean {
        return creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
    }

    protected work(creep: Creep): void {
        CreepTrait.build(creep, this.getCurrentStructureTarget(creep));
    }

    protected rest(creep: Creep): void {
        // const grave = Utils.getRoomGraves(creep.room).shift();
        // if (grave) {
        //     CreepTrait.pickupAllEnergy(creep, grave);
        //
        //     return;
        // }

        const enemySource: Structure = creep.room.find(FIND_HOSTILE_STRUCTURES, {
            filter: (structure: StructureSpawn | StructureStorage | StructureContainer | StructureTower) =>
                ((structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE || structure.structureType === STRUCTURE_TOWER)
                    // @ts-ignore
                    && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
        }).sort(Sort.byDistance(creep)).shift();

        if (enemySource) {
            CreepTrait.withdrawAllEnergy(creep, enemySource)
        } else {
            CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, [STRUCTURE_CONTAINER, STRUCTURE_STORAGE], 100));
            CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, SOURCE_STRUCTURES, Utils.getBodyCost(BASE_WORKER_CREEP_BODY) + 50));
        }
    }

    protected shouldRenewTarget(creep: Creep): boolean {
        const target = this.getCurrentStructureTarget(creep);

        if (target instanceof ConstructionSite) {
            return false;
        }

        return target instanceof StructureRampart && target.hits > RAMPART_INITIAL_HITS;
    }

    protected getTarget(creep: Creep): ConstructionSite | StructureRampart {
        const rampart = creep.room
            .find<StructureRampart>(FIND_MY_STRUCTURES, {
                filter: (rampart) => rampart.structureType === STRUCTURE_RAMPART && rampart.hits < RAMPART_INITIAL_HITS
            })
            .sort(Sort.byDistance(creep))
            .shift();

        if (rampart) {
            return rampart;
        }

        return creep.room
            .find(FIND_CONSTRUCTION_SITES)
            .sort(Sort.byDistance(creep.room.find(FIND_MY_SPAWNS).shift()))
            .shift();
    }

    protected createPrototype(spawn: StructureSpawn): ProtoCreep | null {
        const strategy = new AndChainSpawnStrategy(
            [
                new RoomFindSpawnStrategy(FIND_MY_CONSTRUCTION_SITES),
                RoleCountStrategy.room(BUILDERS_COUNT_LIMIT, this),
            ]
        );

        if (strategy.shouldSpawn(spawn)) {
            return new ProtoCreep(
                Utils.getBiggerPossibleBody(WORKER_BODIES.filter(BodyFilter.byPartsCount(6, [WORK])), BASE_WORKER_CREEP_BODY, spawn),
                this.getDefaultMemory(spawn)
            );
        }

        return null;
    }
}
