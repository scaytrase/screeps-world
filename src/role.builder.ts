import Role from "./role";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import SpawnStrategy from "./spawn_strategy";
import {BUILDER_BODY, BUILDERS_COUNT, BUILDERS_ENERGY_LIMIT} from "./config";
import CreepTrait from "./creep_traits";

const ROLE_BUILDER = 'builder';

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_SPAWN
];

export default class BuilderRole implements Role {
    private static getSource(creep: Creep): AnyStructure | null {
        let sources = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return SOURCE_STRUCTURES.includes(structure.structureType) &&
                    structure['store'].getUsedCapacity(RESOURCE_ENERGY) > BUILDERS_ENERGY_LIMIT;
            }
        });

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

    run(creep: Creep) {
        if (creep.memory['building'] && creep['store'][RESOURCE_ENERGY] == 0) {
            creep.memory['building'] = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory['building'] && creep['store'].getFreeCapacity() == 0) {
            creep.memory['building'] = true;
            creep.say('🚧 build');
        }

        if (creep.memory['building']) {
            const target = BuilderRole.getTarget(creep);
            if (target) {
                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        } else {
            const source = BuilderRole.getSource(creep);
            if (source) {
                if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }

        CreepTrait.renewIfNeeded(creep);
    }

    match(creep: Creep) {
        return creep.memory['role'] == ROLE_BUILDER;
    }

    spawn(spawn: StructureSpawn, game: Game) {
        spawn.spawnCreep(
            BUILDER_BODY,
            'Builder' + game.time,
            {memory: {role: ROLE_BUILDER}}
        )
    }

    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(BUILDERS_COUNT, this);
    }
}
