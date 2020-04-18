import SpawnStrategy from "../spawn_strategy";

export default class RoomFindSpawnStrategy<K extends FindConstant> implements SpawnStrategy {
    private readonly condition: K;
    private readonly filter: FilterOptions<K>;
    private readonly limit: number;

    constructor(condition: K, filter?: FilterOptions<K>, limit: number = 0) {
        this.condition = condition;
        this.filter = filter;
        this.limit = limit;
    }

    shouldSpawn(spawn: StructureSpawn): boolean {
        return spawn.room.find(this.condition, this.filter).length > this.limit;
    }
}
