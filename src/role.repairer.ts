import Role from "./role";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import SpawnStrategy from "./spawn_strategy";
import {REPAIRER_BODY, REPAIRERS_COUNT, REPAIRERS_ENERGY_LIMIT} from "./config";
import CreepTrait from "./creep_traits";

const ROLE_REPAIRER = 'repairer';

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_SPAWN
];

export default class RepairerRole implements Role {
    private static getTarget(creep: Creep): AnyStructure | null {
        const targets = creep.room.find(FIND_STRUCTURES, {
            filter: object => object.hits < object.hitsMax
        });

        targets.sort((a, b) => a.hits / a.hitsMax - b.hits / b.hitsMax);

        if (targets.length > 0) {
            return targets[0];
        }

        return null
    }

    private static getSource(creep: Creep): AnyStructure | null {
        let sources = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return SOURCE_STRUCTURES.includes(structure.structureType) &&
                    structure['store'].getUsedCapacity(RESOURCE_ENERGY) > REPAIRERS_ENERGY_LIMIT;
            }
        });

        if (sources.length > 0) {
            return sources[0];
        }

        return null;
    }

    run(creep: Creep) {
        if (creep.memory['repairing'] && creep['store'][RESOURCE_ENERGY] == 0) {
            creep.memory['repairing'] = false;
            creep.say('🔄 harvest');
        } else if (!creep.memory['repairing'] && creep['store'].getFreeCapacity() == 0) {
            creep.memory['repairing'] = true;
            creep.say('🚧 repair');
        }

        if (creep.memory['repairing']) {
            CreepTrait.repair(creep, RepairerRole.getTarget(creep));
        } else {
            CreepTrait.withdraw(creep, RepairerRole.getSource(creep));
        }

        CreepTrait.renewIfNeeded(creep);
    }

    match(creep: Creep) {
        return creep.memory['role'] == ROLE_REPAIRER;
    }

    spawn(spawn: StructureSpawn, game: Game) {
        spawn.spawnCreep(
            REPAIRER_BODY,
            'Repairer' + game.time,
            {memory: {role: ROLE_REPAIRER}}
        )
    }

    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(REPAIRERS_COUNT, this);
    }
}
