import Runnable from "./runnable";
import Role from "./role";

export default class RoleSpawner implements Runnable {
    private readonly role: Role;
    private readonly spawn: StructureSpawn;

    constructor(spawn: StructureSpawn, role: Role) {
        this.spawn = spawn;
        this.role = role;
    }

    run(game: Game, memory: Memory): void {
        if (this.role.getSpawnStrategy().shouldSpawn(game)) {
            this.role.spawn(this.spawn, game);
        }
    }
}