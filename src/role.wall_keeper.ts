import {WALL_DESIRED_HITS, WALL_KEEPER_BODY, WALL_KEEPERS_COUNT} from "./config";
import CreepTrait from "./creep_traits";
import Role from "./role";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";

const _ = require('lodash');

const ROLE_WALL_KEEPER = 'wall_keeper';
const TARGET_STRUCTURES: StructureConstant[] = [
    STRUCTURE_WALL,
    STRUCTURE_RAMPART,
];
const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
];

const wallToRepairFilter = (object: AnyStructure) => TARGET_STRUCTURES.includes(object.structureType) && object.hits < WALL_DESIRED_HITS;

export default class WallKeeperRole implements Role {
    private static getTarget(creep: Creep): AnyStructure | null {
        let targets = creep.room.find(FIND_STRUCTURES, {filter: wallToRepairFilter});

        targets = targets.sort((a, b) => a.hits / a.hitsMax - b.hits / b.hitsMax);

        return targets.shift();
    }

    private static getSource(creep: Creep): AnyStructure | null {
        let sources = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return SOURCE_STRUCTURES.includes(structure.structureType) &&
                    structure['store'].getUsedCapacity(RESOURCE_ENERGY) >= creep.carryCapacity;
            }
        });

        sources = sources.sort((a, b) => Math.sign(a.pos.getRangeTo(creep) - b.pos.getRangeTo(creep)));

        return sources.shift();
    }

    private static getBody(game: Game) {
        return WALL_KEEPER_BODY;
    }

    run(creep: Creep, game: Game): void {
        if (creep.memory['target'] !== undefined) {
            let target: AnyStructure = Game.getObjectById(creep.memory['target']);
            if (!target || target.hits > WALL_DESIRED_HITS) {
                creep.memory['target'] = undefined;
            }

        }

        if (creep.memory['target'] === undefined) {
            const target = WallKeeperRole.getTarget(creep);
            if (target) {
                creep.memory['target'] = target.id;
            }
        }

        if (creep.memory['repairing'] && creep['store'][RESOURCE_ENERGY] == 0) {
            creep.memory['repairing'] = false;
            creep.say('🔄 harvest');
        } else if (!creep.memory['repairing'] && creep['store'].getFreeCapacity() == 0) {
            creep.memory['repairing'] = true;
            creep.say('🚧 repair');
        }

        if (creep.memory['repairing']) {
            let target: AnyStructure = creep.memory['target'] === undefined ? WallKeeperRole.getTarget(creep) : Game.getObjectById(creep.memory['target']);
            CreepTrait.repair(creep, target);
        } else {
            CreepTrait.withdrawAllEnergy(creep, WallKeeperRole.getSource(creep));
        }

        CreepTrait.renewIfNeeded(creep);
    }

    match(creep: Creep): boolean {
        return creep.memory['role'] == ROLE_WALL_KEEPER;
    }

    spawn(spawn: StructureSpawn, game: Game): void {
        spawn.spawnCreep(
            WallKeeperRole.getBody(game),
            'WallKeeper' + game.time,
            {memory: {role: ROLE_WALL_KEEPER}}
        );
    }

    getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy(
            [
                new FoundMoreThanLimitSpawnStrategy(0, FIND_STRUCTURES, {filter: wallToRepairFilter}),
                new LimitedSpawnByRoleCountStrategy(WALL_KEEPERS_COUNT, this),
            ]
        );
    }
}
