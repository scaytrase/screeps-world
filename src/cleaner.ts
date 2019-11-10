import Runnable from "./runnable";

export default class Cleaner implements Runnable {
    run(game: Game, memory: Memory): void {
        for (let name in memory.creeps) {
            if (!game.creeps[name]) {
                delete memory.creeps[name];
                console.log('Removed non-existent creep memory', name);
            }
        }
    }
}
