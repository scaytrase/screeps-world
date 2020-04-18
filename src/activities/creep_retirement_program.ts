import CreepTrait from "../creep_traits";
import Activity from "../activity";
import Utils from "../utils/utils";

export default class CreepRetirementProgram implements Activity {
    run(): void {
        for (const creep of Object.values(Game.creeps)) {
            if (creep.memory['immortal']) {
                continue;
            }

            CreepTrait.suicideOldCreep(creep, Utils.getCreepRenewTtl(creep));
        }
    }
}
