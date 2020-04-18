import EconomyUtils from "./utils/economy_utils";
import SpawnKeeperRole from "./role/spawn_keeper";
import Utils from "./utils/utils";

export enum ECONOMY_LEVEL {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low'
}

export default class Economy {
    public static getCurrentEconomyLevel(room: Room): ECONOMY_LEVEL {
        if (Economy.anyEmergency(room)) {
            return ECONOMY_LEVEL.LOW;
        }

        return ECONOMY_LEVEL.HIGH;
    }

    public static anyEmergency(room: Room): boolean {
        return this.isHarvesterEmergency(room);
    }

    public static isHarvesterEmergency(room: Room): boolean {
        return room.energyAvailable < 500
            && (
                EconomyUtils.usableSpawnEnergyAvailable(room) < 1000 ||
                Utils.findCreepsByRole(new SpawnKeeperRole(), room).length === 0
            );
    }
}
