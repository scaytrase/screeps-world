import CreepTrait from "./creep_traits";
import Runnable from "./runnable";
import Utils from "./utils";

export default class CreepRetirementProgram implements Runnable {
    run(): void {
        for (const creep of Object.values(Game.creeps)) {
            if (creep.memory['immortal']) {
                continue;
            }

            CreepTrait.suicideOldCreep(creep, Utils.getCreepRenewTtl(creep));
        }
    }
}
