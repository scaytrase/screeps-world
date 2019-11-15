import SpawnStrategy from "./spawn_strategy";

export default class FoundMoreThanLimitSpawnStrategy<K extends FindConstant> implements SpawnStrategy {
    private readonly condition: K;
    private readonly filter: FilterOptions<K>;
    private readonly limit: number;

    constructor(limit: number, condition: K, filter?: FilterOptions<K>) {
        this.condition = condition;
        this.filter = filter;
        this.limit = limit;
    }

    shouldSpawn(spawn: StructureSpawn, game: Game): boolean {
        return spawn.room.find(this.condition, this.filter).length > this.limit;
    }
}
