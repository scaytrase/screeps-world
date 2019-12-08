import {SPAWN_KEEPER_BODY, SPAWN_KEEPERS_COUNT_LIMIT} from "./config";
import CreepTrait from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_LINK,
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
];
const TARGET_STRUCTURES: StructureConstant[] = [
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
    STRUCTURE_TOWER,
];

export default class SpawnKeeperRole extends BaseCreepRole {
    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(SPAWN_KEEPERS_COUNT_LIMIT, this);
    }

    run(creep: Creep, game: Game): void {
        if (creep.store.getFreeCapacity() > 0) {
            CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, SOURCE_STRUCTURES));
        } else {
            CreepTrait.transferAllEnergy(creep, Utils.getClosestEnergyRecipient(creep, TARGET_STRUCTURES));
        }
    }

    protected getRoleName(): string {
        return 'spawn_keeper';
    }

    protected getBody(game: Game): BodyPartConstant[] {
        return SPAWN_KEEPER_BODY;
    }
}
