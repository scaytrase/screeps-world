import Runnable from "./runnable";

export default class CreepSpawnBound implements Runnable {
    private readonly spawn: StructureSpawn;

    constructor(spawn: StructureSpawn) {
        this.spawn = spawn;
    }

    run(game: Game, memory: Memory): void {
        for (let name in game.creeps) {
            let creep = game.creeps[name];

            if (creep.spawning) {
                continue;
            }

            if (creep.room.find(FIND_MY_SPAWNS).length === 0) {
                creep.moveTo(this.spawn);
            }
        }
    }
}
