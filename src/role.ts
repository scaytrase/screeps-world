import SpawnStrategy from "./spawn_strategy";

export default interface Role {
    run(creep: Creep, game: Game): void;

    match(creep: Creep): boolean;

    spawn(spawn: StructureSpawn, game: Game): ScreepsReturnCode;

    getSpawnStrategy(): SpawnStrategy;

    isPrioritySpawn(spawn: StructureSpawn, game: Game): boolean;
}
