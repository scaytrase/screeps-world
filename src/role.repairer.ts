import Role from "./role";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import SpawnStrategy from "./spawn_strategy";
import {REPAIRER_ADVANCED_BODY, REPAIRER_BODY, REPAIRER_HEALTH_LIMIT_RATIO, REPAIRERS_COUNT} from "./config";
import CreepTrait from "./creep_traits";

const _ = require('lodash');

const ROLE_REPAIRER = 'repairer';
const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
];

export default class RepairerRole implements Role {
    private static getTarget(creep: Creep): AnyStructure | null {
        let targets = creep.room.find(FIND_STRUCTURES, {
            filter: object => object.structureType !== STRUCTURE_WALL && object.hits < object.hitsMax
        });

        targets = targets.sort((a, b) => a.hits / a.hitsMax - b.hits / b.hitsMax);

        if (targets.length > 0) {
            return targets[0];
        }

        return null
    }

    private static getSource(creep: Creep): AnyStructure | null {
        let sources = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return SOURCE_STRUCTURES.includes(structure.structureType) &&
                    structure['store'].getUsedCapacity(RESOURCE_ENERGY) >= creep.carryCapacity;
            }
        });

        sources = sources.sort((a, b) => Math.sign(a.pos.getRangeTo(creep) - b.pos.getRangeTo(creep)));

        if (sources.length > 0) {
            return sources[0];
        }

        return null;
    }

    run(creep: Creep) {
        if (creep.memory['target'] !== undefined) {
            let target: AnyStructure = Game.getObjectById(creep.memory['target']);
            if (target.hits / target.hitsMax > REPAIRER_HEALTH_LIMIT_RATIO) {
                creep.memory['target'] = undefined;
            }
        }

        if (creep.memory['target'] === undefined) {
            creep.memory['target'] = RepairerRole.getTarget(creep).id;
        }

        if (creep.memory['repairing'] && creep['store'][RESOURCE_ENERGY] == 0) {
            creep.memory['repairing'] = false;
            creep.say('🔄 harvest');
        } else if (!creep.memory['repairing'] && creep['store'].getFreeCapacity() == 0) {
            creep.memory['repairing'] = true;
            creep.say('🚧 repair');
        }

        if (creep.memory['repairing']) {
            let target: AnyStructure = creep.memory['target'] === undefined ? RepairerRole.getTarget(creep) : Game.getObjectById(creep.memory['target']);
            CreepTrait.repair(creep, target);
        } else {
            CreepTrait.withdraw(creep, RepairerRole.getSource(creep));
        }

        CreepTrait.renewIfNeeded(creep);
    }

    match(creep: Creep) {
        return creep.memory['role'] == ROLE_REPAIRER;
    }

    private getBody(game: Game) {
        const currentCreepCount = this.getCurrentCreepCount(game);
        if (currentCreepCount < 3) {
            return REPAIRER_BODY;
        }

        return REPAIRER_ADVANCED_BODY;
    }

    getCurrentCreepCount(game: Game): Number {
        return _.filter(game.creeps, (creep: Creep) => this.match(creep)).length;
    }

    spawn(spawn: StructureSpawn, game: Game) {
        spawn.spawnCreep(
            this.getBody(game),
            'Repairer' + game.time,
            {memory: {role: ROLE_REPAIRER}}
        )
    }

    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(REPAIRERS_COUNT, this);
    }
}
