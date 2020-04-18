import Activity from "../activity";

export default class Cleaner implements Activity {
    run(): void {
        for (let name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
    }
}
