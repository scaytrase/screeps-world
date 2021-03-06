import {GRAVE_KEEPERS_COUNT_LIMIT} from "../config/config";
import {BASE_CARRIER_CREEP_BODY, CARRIER_BODIES} from "../config/const";
import CreepTrait from "../creep_traits";
import BaseCreepRole from "../base_roles/base_creep";
import {Sort} from "../utils/sort_utils";
import AndChainSpawnStrategy from "../spawn_strategy/and_chain";
import NotEmptyCallableResult from "../spawn_strategy/not_empty_callable_result";
import RoleCountStrategy from "../spawn_strategy/role_count";
import Utils from "../utils/utils";
import ProtoCreep from "../proto_creep";
import BodyFilter from "../utils/body_filter";

const STORAGE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_TERMINAL,
    STRUCTURE_SPAWN,
];

const ENERGY_STORAGE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_EXTENSION,
    STRUCTURE_SPAWN,
    STRUCTURE_LINK,
    STRUCTURE_TERMINAL,
];

export default class GraveKeeperRole extends BaseCreepRole {
    private static getSource(creep: Creep): Resource | Tombstone | Ruin | null {
        return Utils.getRoomGraves(creep.room).sort(Sort.byDistance(creep)).shift();
    }

    private static getTarget(creep: Creep): AnyStructure | null {
        if (creep.store.getUsedCapacity() === creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
            return creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ENERGY_STORAGE_STRUCTURES.includes(structure.structureType) &&
                        structure['store'].getFreeCapacity() > 0;
                }
            }).sort(Sort.byDistance(creep)).shift();
        }

        return creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return STORAGE_STRUCTURES.includes(structure.structureType) &&
                    structure['store'].getFreeCapacity() > 0;
            }
        }).sort(Sort.byDistance(creep)).shift();
    }

    run(creep: Creep): void {
        const source = GraveKeeperRole.getSource(creep);
        if (source && creep.store.getFreeCapacity() > 0 && creep.ticksToLive > 100) {
            CreepTrait.pickupAllResources(creep, source);
        } else if (creep.store.getUsedCapacity() > 0) {
            CreepTrait.transferAllResources(creep, GraveKeeperRole.getTarget(creep));
        } else {
            CreepTrait.goToParking(creep);
        }
    }

    public getRoleName(): string {
        return 'grave_keeper';
    }

    protected createPrototype(spawn: StructureSpawn): ProtoCreep | null {
        const strategy = new AndChainSpawnStrategy([
            new NotEmptyCallableResult((spawn) => Utils.getRoomGraves(spawn.room).shift()),
            RoleCountStrategy.room(GRAVE_KEEPERS_COUNT_LIMIT, this)
        ]);

        if (strategy.shouldSpawn(spawn)) {
            return new ProtoCreep(
                Utils.getBiggerPossibleBodyNow(CARRIER_BODIES.filter(BodyFilter.byPartsCount(10, [CARRY])), BASE_CARRIER_CREEP_BODY, spawn),
                this.getDefaultMemory(spawn)
            );
        }

        return null;
    }
}
