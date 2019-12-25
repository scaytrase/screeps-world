import Role from "./role";
import Runnable from "./runnable";

export default class CreepSpawner implements Runnable {
    private readonly roles: Role[] = [];
    private readonly spawn: StructureSpawn;

    constructor(roles: Array<Role>, spawn: StructureSpawn) {
        this.roles = roles;
        this.spawn = spawn;
    }

    run(game: Game, memory: Memory): void {
        if (false && this.spawn.spawning && this.spawn.spawning.remainingTime > 0) {
            const spawning = this.spawn.spawning;
            console.log(`[INFO] Spawning ${spawning.name} (${spawning.remainingTime}/${spawning.needTime})`);

            return;
        }

        for (let role of this.roles) {
            const shouldSpawn = role.getSpawnStrategy().shouldSpawn(this.spawn, game);
            let result = null;
            if (shouldSpawn) {
                result = role.spawn(this.spawn, game);

                if (role.isPrioritySpawn() && result !== OK) {
                    console.log(`Priority role ${role.constructor.name} spawn failed with ${result}`);

                    return;
                } else if (result === OK) {
                    console.log(`Spawning ${role.constructor.name}`);
                } else {
                    console.log(`Not spawning ${role.constructor.name} with ${result}`);
                }
            } else {
                console.log(`Not spawning ${role.constructor.name}`);
            }
        }
    }
}
