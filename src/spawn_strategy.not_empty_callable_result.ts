import SpawnStrategy from "./spawn_strategy";

export default class NotEmptyCallableResult implements SpawnStrategy {
    private readonly callable: (game: Game, spawn: StructureSpawn) => any;

    constructor(callable: (game: Game, spawn: StructureSpawn) => any) {
        this.callable = callable;
    }

    shouldSpawn(spawn: StructureSpawn, game: Game): boolean {
        return this.callable(game, spawn) !== null;
    }
}
