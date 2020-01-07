import SpawnStrategy from "./spawn_strategy";

export default interface Role {
    getRoleName(): string;

    run(creep: Creep): void;

    match(creep: Creep): boolean;

    spawn(spawn: StructureSpawn): ScreepsReturnCode;

    getSpawnStrategy(): SpawnStrategy;

    isPrioritySpawn(spawn: StructureSpawn): boolean;
}
