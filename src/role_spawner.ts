import Role from "./role";
import Runnable from "./runnable";

export default class RoleSpawner implements Runnable {
    private readonly role: Role;
    private readonly spawn: StructureSpawn;

    constructor(spawn: StructureSpawn, role: Role) {
        this.spawn = spawn;
        this.role = role;
    }

    run(game: Game, memory: Memory): void {
        if (this.role.getSpawnStrategy().shouldSpawn(this.spawn, game)) {
            this.role.spawn(this.spawn, game);
        }
    }
}
