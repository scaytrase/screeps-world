import Runnable from "./runnable";
import {RESOURCE_ASSIGN_ALGO_VERSION, RESOURCE_ASSIGN_NORMALIZE_DISTANCE} from "./config";

const _ = require('lodash');

export const RESOURCE_ASSIGNMENT = 'assigned_to_resource_id';
const ALGO_VER = 'assigned_to_resource_algo_ver';

export default class ResourceAssigner implements Runnable {
    private readonly spawn: StructureSpawn;

    constructor(spawn: StructureSpawn) {
        this.spawn = spawn;
    }

    private static createResourceMap(sources: Source[], creeps: { [p: string]: Creep }): Map<Source, number> {
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
        return resourceMap;
    }

    public run(game: Game, memory: Memory): void {
        const sources = this.spawn.room.find(FIND_SOURCES);
        _.forEach(
            game.creeps,
            (creep: Creep) => this.assignResource(creep, sources, game.creeps)
        );

        let map = ResourceAssigner.createResourceMap(sources, game.creeps);
        for (let resource of map.keys()) {
            console.log(`Resource "${resource.id}": ${map.get(resource)} Creeps assigned`)
        }
    }

    private assignResource(creep: Creep, sources: Source[], creeps: { [creepName: string]: Creep }): void {
        if (creep.memory['role'] !== 'harvester') {
            creep.memory[RESOURCE_ASSIGNMENT] = undefined;
            return;
        }

        if (sources.length === 0) {
            return;
        }

        if (creep.memory[RESOURCE_ASSIGNMENT] !== undefined && creep.memory[ALGO_VER] === RESOURCE_ASSIGN_ALGO_VERSION) {
            return;
        }

        let resourceMap = ResourceAssigner.createResourceMap(sources, creeps);

        if (RESOURCE_ASSIGN_NORMALIZE_DISTANCE) {
            for (let resource of resourceMap.keys()) {
                resourceMap.set(resource, resourceMap.get(resource) / resource.pos.getRangeTo(this.spawn))
            }
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
