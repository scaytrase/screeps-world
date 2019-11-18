import {RENEW_CREEPS, TTL_RENEW_LIMIT} from "./config";
import CreepTrait from "./creep_traits";
import Runnable from "./runnable";

export default class CreepRenewer implements Runnable {
    private spawn: StructureSpawn;

    constructor(spawn: StructureSpawn) {
        this.spawn = spawn;
    }

    run(game: Game, memory: Memory): void {
        for (let creepName in game.creeps) {
            const creep = game.creeps[creepName];
            CreepTrait.renewIfNeeded(creep);

            if (RENEW_CREEPS && creep.ticksToLive < TTL_RENEW_LIMIT) {
                this.spawn.renewCreep(creep);
            }
        }
    }
}
