import CreepTrait from "./creep_traits";
import Runnable from "./runnable";

export default class CreepRetirementProgram implements Runnable {
    run(game: Game, memory: Memory): void {
        for (let creepName in game.creeps) {
            const creep = game.creeps[creepName];

            CreepTrait.suicideOldCreep(creep, 150);
        }
    }
}
