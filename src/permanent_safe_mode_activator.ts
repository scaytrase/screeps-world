import {USE_PERMANENT_SAFE_MODE} from "./config";
import Runnable from "./runnable";

export default class PermanentSafeModeActivator implements Runnable {
    private readonly spawn: StructureSpawn;

    constructor(spawn: StructureSpawn) {
        this.spawn = spawn;
    }

    run(game: Game, memory: Memory): void {
        if (!USE_PERMANENT_SAFE_MODE) {
            return;
        }

        const controller = this.spawn.room.controller;
        if (controller.safeMode === undefined && controller.safeModeAvailable) {
            controller.activateSafeMode();
        }
    }
}
