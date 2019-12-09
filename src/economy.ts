export enum ECONOMY_LEVEL {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low'
}

export default class EconomyUtils {
    public static getCurrentEconomyLevel(game: Game, memory: Memory): ECONOMY_LEVEL {
        return ECONOMY_LEVEL.HIGH;
    }
}
