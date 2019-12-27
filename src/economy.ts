import SpawnKeeperRole from "./role.spawn_keeper";
import Utils from "./utils";

export enum ECONOMY_LEVEL {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low'
}

export default class Economy {
    public static getCurrentEconomyLevel(room: Room, game: Game): ECONOMY_LEVEL {
        if (Economy.anyEmergency(room, game)) {
            return ECONOMY_LEVEL.LOW;
        }

        return ECONOMY_LEVEL.HIGH;
    }

    public static anyEmergency(room: Room, game: Game): boolean {
        return this.isHarvesterEmergency(room, game);
    }

    public static isHarvesterEmergency(room: Room, game: Game): boolean {
        return room.energyAvailable < 500
            // || Utils.findCreepsByRole(game, new EnergyAggregatorRole()).length === 0
            || Utils.findCreepsByRole(game, new SpawnKeeperRole()).length === 0;
    }
}
