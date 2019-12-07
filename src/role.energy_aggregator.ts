import {ENERGY_AGGREGATOR_BODY, ENERGY_AGGREGATORS_COUNT_LIMIT} from "./config";
import CreepTrait from "./creep_traits";
import TargetAwareCreepRole from "./role.target_aware_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const ROLE_ENERGY_AGGREGATOR = 'energy_aggregator';

export default class EnergyAggregatorRole extends TargetAwareCreepRole<StructureContainer> {
    public getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy([
            new LimitedSpawnByRoleCountStrategy(ENERGY_AGGREGATORS_COUNT_LIMIT, this),
            new FoundMoreThanLimitSpawnStrategy(0, FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_STORAGE}})
        ]);
    }

    protected getTarget(creep: Creep, game: Game): StructureContainer | null {
        return Utils.getClosestEnergySource<StructureContainer>(creep, [STRUCTURE_CONTAINER]);
    }

    protected getRecipient(creep: Creep): StructureStorage | StructureContainer | null {
        return Utils.getClosestEnergyRecipient<StructureContainer>(creep, [STRUCTURE_LINK, STRUCTURE_STORAGE]);
    }

    protected doRun(creep: Creep, game: Game): void {
        if (creep['store'].getFreeCapacity() > 0) {
            CreepTrait.withdrawAllEnergy(creep, this.getCurrentStructureTarget(creep));
        } else {
            CreepTrait.transferAllEnergy(creep, this.getRecipient(creep));
        }
    }

    protected getBody(game: Game): BodyPartConstant[] {
        return ENERGY_AGGREGATOR_BODY;
    }

    protected getRoleName(): string {
        return ROLE_ENERGY_AGGREGATOR;
    }

    protected shouldRenewTarget(creep: Creep, game: Game): boolean {
        const target = this.getCurrentStructureTarget(creep);

        if (!target) {
            return undefined;
        }

        // @ts-ignore
        return target['store'].getUsedCapacity(RESOURCE_ENERGY) === 0;
    }
}
