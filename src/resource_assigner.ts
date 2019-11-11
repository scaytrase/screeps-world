import Runnable from "./runnable";
import {RESOURCE_ASSIGN_ALGO_VERSION} from "./config";

const _ = require('lodash');

export const RESOURCE_ASSIGNMENT = 'assigned_to_resource_id';
const ALGO_VER = 'assigned_to_resource_algo_ver';

export default class ResourceAssigner implements Runnable {
    private readonly spawn: StructureSpawn;

    constructor(spawn: StructureSpawn) {
        this.spawn = spawn;
    }

    public run(game: Game, memory: Memory): void {
        _.forEach(
            game.creeps,
            (creep: Creep) => ResourceAssigner.assignResource(creep, this.spawn.room.find(FIND_SOURCES), game.creeps)
        );
    }

    private static assignResource(creep: Creep, sources: Source[], creeps: { [creepName: string]: Creep }): void {
        if (sources.length === 0) {
            return;
        }

        if (creep.memory[RESOURCE_ASSIGNMENT] !== undefined && creep.memory[ALGO_VER] === RESOURCE_ASSIGN_ALGO_VERSION) {
            return;
        }

        let resourceMap: Map<Source, number> = new Map<Source, number>();
        for (let source of sources) {
            resourceMap.set(source, 0);
        }

        for (let creepName in creeps) {
            const assignedResource: string = creeps[creepName].memory[RESOURCE_ASSIGNMENT];
            if (assignedResource === undefined) {
                continue;
            }

            let source = Game.getObjectById<Source>(assignedResource);

            resourceMap.set(source, resourceMap.get(source) + 1);
        }

        let minResource: Source = resourceMap.keys().next().value;
        for (let resource of resourceMap.keys()) {
            if (resourceMap.get(resource) < resourceMap.get(minResource)) {
                minResource = resource;
            }
        }

        creep.memory[RESOURCE_ASSIGNMENT] = minResource.id;
        creep.memory[ALGO_VER] = RESOURCE_ASSIGN_ALGO_VERSION;
    }
}
