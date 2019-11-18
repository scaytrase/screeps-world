import {ENERGY_AGGREGATOR_BODY, ENERGY_CENTER, LINK_KEEPERS_COUNT} from "./config";
import CreepTrait from "./creep_traits";
import TargetAwareCreepRole from "./role.target_aware_creep";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const ROLE_LINK_KEEPER = 'link_keeper';

export default class LinkKeeperRole extends TargetAwareCreepRole {
    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(LINK_KEEPERS_COUNT, this);
    }

    protected shouldRenewTarget(creep: Creep, game: Game): boolean {
        const target = this.getCurrentStructureTarget(creep);

        if (target) {
            return target['store'].getUsedCapacity() === 0;
        }

        return true;
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
            CreepTrait.withdrawAllEnergy(creep, this.getCurrentStructureTarget(creep));
        } else {
            CreepTrait.transferAllEnergy(creep, creep.room.storage);
        }

        CreepTrait.renewIfNeeded(creep);
    }

    protected getBody(game: Game): BodyPartConstant[] {
        return ENERGY_AGGREGATOR_BODY;
    }

    protected getRoleName(): string {
        return ROLE_LINK_KEEPER;
    }
}
