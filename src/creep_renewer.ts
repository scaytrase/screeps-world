import Runnable from "./runnable";
import {TTL_RENEW_LIMIT} from "./config";

export default class CreepRenewer implements Runnable {
    private spawn: StructureSpawn;

    constructor(spawn: StructureSpawn) {
        this.spawn = spawn;
    }

    run(game: Game, memory: Memory): void {
        for (let creepName in game.creeps) {
            if (game.creeps[creepName].ticksToLive < TTL_RENEW_LIMIT) {
                this.spawn.renewCreep(game.creeps[creepName])
            }
        }
    }
}
