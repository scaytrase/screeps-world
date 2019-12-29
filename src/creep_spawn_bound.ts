import Runnable from "./runnable";

export default class CreepSpawnBound implements Runnable {
    run(game: Game, memory: Memory): void {
        for (let name in game.creeps) {
            let creep = game.creeps[name];

            if (creep.spawning) {
                continue;
            }

            if (creep.body.filter(part => part.type === CLAIM).length > 0) {
                continue;
            }

            if (creep.memory['role'] === 'remote_builder') {
                return;
            }

            if (creep.memory['spawn']) {
                const spawn = Game.getObjectById<StructureSpawn>(creep.memory['spawn']);
                if (spawn.room !== creep.room) {
                    creep.moveTo(
                        spawn, {
                            visualizePathStyle: {stroke: '#ff55f4'},
                            ignoreCreeps: true
                        });
                }
            }
        }
    }
}
