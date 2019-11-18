import Role from "./role";
import RoleSpawner from "./role_spawner";
import Runnable from "./runnable";

export default class CreepSpawner implements Runnable {
    private readonly spawners: Array<RoleSpawner> = [];

    constructor(roles: Array<Role>, spawn: StructureSpawn) {
        for (let role of roles) {
            this.spawners.push(new RoleSpawner(spawn, role));
        }
    }

    run(game: Game, memory: Memory): void {
        for (let spawner of this.spawners) {
            spawner.run(game, memory);
        }
    }
}
