import {ENERGY_AGGREGATOR_BODY, ENERGY_CENTER, LINK_KEEPERS_COUNT_LIMIT} from "./config";
import CreepTrait from "./creep_traits";
import TargetAwareCreepRole from "./role.target_aware_creep";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

export default class ReceiverLinkKeeperRole extends TargetAwareCreepRole<StructureLink> {
    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(LINK_KEEPERS_COUNT_LIMIT, this);
    }

    protected shouldRenewTarget(creep: Creep, game: Game): boolean {
        const target = this.getCurrentStructureTarget(creep);

        if (!target) {
            return undefined;
        }

        return target['store'].getUsedCapacity() === 0;
    }

    protected getTarget(creep: Creep): StructureLink | null {
        const flag = Utils.getFlagByName(ENERGY_CENTER, creep.room);

        if (!flag) {
            return null;
        }

        return creep.room
            .find<StructureLink>(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_LINK
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
    }

    protected getBody(game: Game): BodyPartConstant[] {
        return ENERGY_AGGREGATOR_BODY;
    }

    protected getRoleName(): string {
        return 'receiver_link_keeper';
    }
}
