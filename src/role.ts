import SpawnStrategy from "./spawn_strategy";

export default interface Role {
    run(creep: Creep, game: Game): void;

    match(creep: Creep): boolean;

    spawn(spawn: StructureSpawn, game: Game): void;

    getSpawnStrategy(): SpawnStrategy;
}
