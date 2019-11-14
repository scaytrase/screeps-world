import Role from "./role";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import SpawnStrategy from "./spawn_strategy";
import {BUILDER_BODY, BUILDERS_COUNT, BUILDERS_ENERGY_LIMIT} from "./config";
import CreepTrait from "./creep_traits";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";

const ROLE_BUILDER = 'builder';

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
];

export default class BuilderRole implements Role {
    private static getSource(creep: Creep): AnyStructure | null {
        let sources = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return SOURCE_STRUCTURES.includes(structure.structureType) &&
                    structure['store'].getUsedCapacity(RESOURCE_ENERGY) >= BUILDERS_ENERGY_LIMIT;
            }
        });

        sources = sources.sort((a, b) => Math.sign(a.pos.getRangeTo(creep) - b.pos.getRangeTo(creep)));

        if (sources.length > 0) {
            return sources[0];
        }

        return null;
    }

    private static getTarget(creep: Creep): ConstructionSite | null {
        let targets = creep.room.find(FIND_CONSTRUCTION_SITES);

        if (targets.length > 0) {
            return targets[0];
        }

        return null;
    }

    run(creep: Creep): void {
        if (creep.memory['building'] && creep['store'][RESOURCE_ENERGY] == 0) {
            creep.memory['building'] = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory['building'] && creep['store'].getFreeCapacity() == 0) {
            creep.memory['building'] = true;
            creep.say('🚧 build');
        }

        if (creep.memory['building']) {
            CreepTrait.build(creep, BuilderRole.getTarget(creep));
        } else {
            CreepTrait.withdraw(creep, BuilderRole.getSource(creep));
        }

        CreepTrait.renewIfNeeded(creep);
    }

    match(creep: Creep): boolean {
        return creep.memory['role'] == ROLE_BUILDER;
    }

    spawn(spawn: StructureSpawn, game: Game): void {
        spawn.spawnCreep(
            BUILDER_BODY,
            'Builder' + game.time,
            {memory: {role: ROLE_BUILDER}}
        )
    }

    getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy(
            [
                new FoundMoreThanLimitSpawnStrategy(0, FIND_MY_CONSTRUCTION_SITES),
                new LimitedSpawnByRoleCountStrategy(BUILDERS_COUNT, this),
            ]
        );
    }
}
