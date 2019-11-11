import {TTL_UNTIL_RENEW} from "./config";

export default class CreepTrait {
    private static getClosestSpawn(creep: Creep): StructureSpawn {
        return creep.pos.findClosestByPath(FIND_MY_SPAWNS);
    }

    public static moveToSpawnToRenew(creep: Creep): void {
        const spawn = CreepTrait.getClosestSpawn(creep);
        creep.moveTo(spawn);
        creep.transfer(spawn, RESOURCE_ENERGY);
    }

    public static renewIfNeeded(creep: Creep): void {
        if (creep.ticksToLive < TTL_UNTIL_RENEW) {
            CreepTrait.moveToSpawnToRenew(creep);
        }
    }
}
