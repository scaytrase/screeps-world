import {ENERGY_AGGREGATOR_BODY, ENERGY_CENTER, LINK_KEEPERS_COUNT} from "./config";
import CreepTrait from "./creep_traits";
import TargetAwareCreepRole from "./role.target_aware_creep";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

export default class LinkKeeperRole extends TargetAwareCreepRole {
    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(LINK_KEEPERS_COUNT, this);
    }

    protected shouldRenewTarget(creep: Creep, game: Game): boolean {
        const target = this.getCurrentStructureTarget(creep);

        if (!target) {
            return undefined;
        }

        return target['store'].getUsedCapacity() === 0;
    }

    protected getTarget(creep: Creep): AnyStructure | null {
        const flag = Utils.getFlagByName(ENERGY_CENTER, creep.room);

        if (!flag) {
            return null;
        }

        return creep.room
            .find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_LINK &&
                        structure['store'].getUsedCapacity() >= 0 &&
                        structure.pos.getRangeTo(flag) < 5;
                }
            })
            .sort(Utils.sortByDistance(flag))
            .shift();
    }

    protected doRun(creep: Creep): void {
        if (creep['store'].getFreeCapacity() > 0) {
            CreepTrait.withdrawAllEnergy(creep, creep.room.storage);
        } else {
            CreepTrait.transferAllEnergy(creep, this.getCurrentStructureTarget(creep));
        }
    }

    protected getBody(game: Game): BodyPartConstant[] {
        return ENERGY_AGGREGATOR_BODY;
    }

    protected getRoleName(): string {
        return 'link_keeper';
    }
}
