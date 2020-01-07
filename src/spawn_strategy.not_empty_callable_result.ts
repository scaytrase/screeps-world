import SpawnStrategy from "./spawn_strategy";

export default class NotEmptyCallableResult implements SpawnStrategy {
    private readonly callable: (spawn: StructureSpawn) => any;

    constructor(callable: (spawn: StructureSpawn) => any) {
        this.callable = callable;
    }

    shouldSpawn(spawn: StructureSpawn): boolean {
        return !!this.callable(spawn);
    }
}
