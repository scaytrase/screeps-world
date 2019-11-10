import Runnable from "./runnable";

const _ = require('lodash');

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

    private static assignResource(creep: Creep, sources: Source[], creeps: { [creepNmae: string]: Creep }): void {
        if (creep.memory['assigned_to_resource_id'] !== undefined) {
            return;
        }

        creep.memory['assigned_to_resource_id'] = _.shuffle(sources)[0].id;
    }
}
