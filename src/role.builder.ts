import {BUILDER_BODY, BUILDERS_COUNT_LIMIT, BUILDERS_ENERGY_LIMIT, RAMPART_INITIAL_HIST} from "./config";
import CreepTrait from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const ROLE_BUILDER = 'builder';

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_LINK,
];

export default class BuilderRole extends BaseCreepRole {
    private static getRampart(creep: Creep): StructureRampart | null {
        return creep.room
            .find<StructureRampart>(FIND_MY_STRUCTURES, {
                filter: (rampart) => rampart.structureType === STRUCTURE_RAMPART && rampart.hits < RAMPART_INITIAL_HIST
            })
            .sort(Utils.sortByDistance(creep))
            .shift();
    }

    private static getTarget(creep: Creep): ConstructionSite | null {

        return creep.room
            .find(FIND_CONSTRUCTION_SITES)
            .sort(Utils.sortByDistance(creep.room.find(FIND_MY_SPAWNS).shift()))
            .shift();
    }

    run(creep: Creep, game: Game): void {
        if (creep.memory['building'] && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory['building'] = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory['building'] && creep['store'].getFreeCapacity() == 0) {
            creep.memory['building'] = true;
            creep.say('🚧 build');
        }

        if (creep.memory['building']) {
            const rampart = BuilderRole.getRampart(creep);
            if (rampart) {
                CreepTrait.repair(creep, rampart);
            } else {
                CreepTrait.build(creep, BuilderRole.getTarget(creep));
            }
        } else {
            CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, SOURCE_STRUCTURES, BUILDERS_ENERGY_LIMIT));
        }
    }

    getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy(
            [
                new FoundMoreThanLimitSpawnStrategy(0, FIND_MY_CONSTRUCTION_SITES),
                new LimitedSpawnByRoleCountStrategy(BUILDERS_COUNT_LIMIT, this),
            ]
        );
    }

    protected getBody(game: Game): BodyPartConstant[] {
        return BUILDER_BODY;
    }

    protected getRoleName(): string {
        return ROLE_BUILDER;
    }
}
