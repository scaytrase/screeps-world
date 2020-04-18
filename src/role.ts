export default interface Role {
    getRoleName(): string;

    run(creep: Creep): void;

    match(creep: Creep): boolean;

    spawn(spawn: StructureSpawn): ScreepsReturnCode;

    isPrioritySpawn(spawn: StructureSpawn): boolean;
}
