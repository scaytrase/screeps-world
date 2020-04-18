import {TOWER_KEEPERS_COUNT_LIMIT} from "../config/config";
import {BASE_CARRIER_CREEP_BODY, CARRIER_BODIES} from "../config/const";
import CreepTrait from "../creep_traits";
import BaseCreepRole from "../base_roles/base_creep";
import SpawnStrategy from "../spawn_strategy";
import AndChainSpawnStrategy from "../spawn_strategy/and_chain";
import RoleCountStrategy from "../spawn_strategy/role_count";
import RoomFindSpawnStrategy from "../spawn_strategy/room_find";
import Utils from "../utils/utils";

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
];

const TARGET_STRUCTURES: StructureConstant[] = [
    STRUCTURE_TOWER,
];

export default class TowerKeeperRole extends BaseCreepRole {
    getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy([
            RoleCountStrategy.room(TOWER_KEEPERS_COUNT_LIMIT, this),
            new RoomFindSpawnStrategy(FIND_MY_STRUCTURES, {
                filter: (structure) =>
                    structure.structureType === STRUCTURE_TOWER &&
                    // @ts-ignore
                    structure.store.getFreeCapacity() > 500
            })
        ]);
    }

    run(creep: Creep): void {
        if (creep.store.getFreeCapacity() > 0) {
            CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, SOURCE_STRUCTURES));
        } else {
            CreepTrait.transferAllEnergy(creep, Utils.getClosestEnergyRecipient(creep, TARGET_STRUCTURES));
        }
    }

    public getRoleName(): string {
        return 'tower_keeper';
    }

    protected getBody(spawn: StructureSpawn): BodyPartConstant[] {
        const bodies = CARRIER_BODIES.filter(body => body.filter(part => part === CARRY).length <= 4);

        return Utils.getBiggerPossibleBodyNow(bodies, BASE_CARRIER_CREEP_BODY, spawn);
    }
}
