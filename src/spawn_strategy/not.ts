import SpawnStrategy from "../spawn_strategy";

export default class NotSpawnStrategy implements SpawnStrategy {
    private readonly strategy: SpawnStrategy;

    constructor(strategy: SpawnStrategy) {
        this.strategy = strategy;
    }

    shouldSpawn(spawn: StructureSpawn): boolean {
        return !this.strategy.shouldSpawn(spawn);
    }
}
