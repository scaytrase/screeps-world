import SpawnStrategy from "./spawn_strategy";

export default interface Role {
    run(creep: Creep): void;

    match(creep: Creep): boolean;

    spawn(spawn: StructureSpawn, game: Game);

    getSpawnStrategy(): SpawnStrategy;
}
