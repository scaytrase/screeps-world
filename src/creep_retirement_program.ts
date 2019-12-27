import {SUICIDE_TTL} from "./config";
import CreepTrait from "./creep_traits";
import Runnable from "./runnable";

export default class CreepRetirementProgram implements Runnable {
    run(game: Game, memory: Memory): void {
        for (let creepName in game.creeps) {
            const creep = game.creeps[creepName];

            if (creep.body.filter(part => part.type === CLAIM).length > 0) {
                continue;
            }

            CreepTrait.suicideOldCreep(creep, SUICIDE_TTL);
        }
    }
}
