import {CARRIER_CREEP_BODY_LVL3, SPAWN_KEEPER_BODY, SPAWN_KEEPERS_COUNT_LIMIT} from "./config";
import CreepTrait from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
];

const TARGET_STRUCTURES: StructureConstant[] = [
    STRUCTURE_TERMINAL
];

export default class TerminalKeeperRole extends BaseCreepRole {
    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(1, this);
    }

    run(creep: Creep, game: Game): void {
        const target: StructureTerminal | null = Utils.getClosestEnergyRecipient(creep, TARGET_STRUCTURES);
        if (target && target.store.getUsedCapacity() < 5000) {
            if (creep.store.getFreeCapacity() > 0) {
                CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, SOURCE_STRUCTURES));
            } else {
                CreepTrait.transferAllEnergy(creep, target);
            }
        }
    }

    protected getRoleName(): string {
        return 'terminal_keeper';
    }

    protected getBody(game: Game): BodyPartConstant[] {
        return CARRIER_CREEP_BODY_LVL3;
    }
}
