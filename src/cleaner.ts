import Runnable from "./runnable";

export default class Cleaner implements Runnable {
    run(): void {
        for (let name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
    }
}
