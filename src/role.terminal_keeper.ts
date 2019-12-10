import {CARRIER_CREEP_BODY_LVL3, TERMINAL_ENERGY_REQUIREMENT} from "./config";
import CreepTrait from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import NotEmptyCallableResult from "./spawn_strategy.not_empty_callable_result";
import Utils from "./utils";

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
];

const TARGET_STRUCTURES: StructureConstant[] = [
    STRUCTURE_TERMINAL
];

export default class TerminalKeeperRole extends BaseCreepRole {
    getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy([
            new LimitedSpawnByRoleCountStrategy(1, this),
            new NotEmptyCallableResult((game, spawn) => {
                const target: StructureTerminal | null = Utils.getClosestEnergyRecipient(spawn, TARGET_STRUCTURES);
                return target.store.getUsedCapacity(RESOURCE_ENERGY) < TERMINAL_ENERGY_REQUIREMENT ? target : null;
            })
        ]);
    }

    run(creep: Creep, game: Game): void {
        const target: StructureTerminal | null = Utils.getClosestEnergyRecipient(creep, TARGET_STRUCTURES);
        if (target && target.store.getUsedCapacity(RESOURCE_ENERGY) < TERMINAL_ENERGY_REQUIREMENT) {
            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
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
