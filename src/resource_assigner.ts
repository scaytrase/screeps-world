import {RESOURCE_ASSIGN_ALGO_VERSION, SUICIDE_TTL} from "./config";
import Runnable from "./runnable";

const _ = require('lodash');

export const RESOURCE_ASSIGNMENT = 'target';
const ALGO_VER = 'assign_algo';

export default class ResourceAssigner implements Runnable {
    private readonly room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    private static createResourceMap(sources: Source[], creeps: { [p: string]: Creep }): Map<Source, number> {
        let resourceMap: Map<Source, number> = new Map<Source, number>();
        for (let source of sources) {
            resourceMap.set(source, 0);
        }

        for (let creepName in creeps) {
            if (creeps[creepName].ticksToLive < SUICIDE_TTL) {
                continue;
            }

            const assignedResource: Id<Source> = creeps[creepName].memory[RESOURCE_ASSIGNMENT];
            if (assignedResource === undefined) {
                continue;
            }

            let source = Game.getObjectById(assignedResource);

            resourceMap.set(source, resourceMap.get(source) + 1);
        }
        return resourceMap;
    }

    public run(game: Game, memory: Memory): void {
        const sources = this.room.find(FIND_SOURCES);
        _.forEach(
            game.creeps,
            (creep: Creep) => this.assignResource(creep, sources, game.creeps)
        );
    }

    private assignResource(creep: Creep, sources: Source[], creeps: { [creepName: string]: Creep }): void {
        if (creep.room.name !== this.room.name) {
            return;
        }

        if (creep.memory['role'] !== 'harvester') {
            return;
        }

        if (creep.memory['spawn'] && Game.getObjectById<StructureSpawn>(creep.memory['spawn']).room.name !== this.room.name) {
            return;
        }

        if (creep.ticksToLive < SUICIDE_TTL) {
            return;
        }

        if (sources.length === 0) {
            return;
        }

        if (creep.memory[RESOURCE_ASSIGNMENT] !== undefined && creep.memory[ALGO_VER] === RESOURCE_ASSIGN_ALGO_VERSION) {
            return;
        }

        console.log(`Assigning creep ${creep.name} in room ${this.room.name}`);

        let resourceMap = ResourceAssigner.createResourceMap(sources, creeps);

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
