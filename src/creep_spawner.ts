import Logger from "./logger";
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
        for (let role of this.roles) {
            const shouldSpawn = role.getSpawnStrategy().shouldSpawn(this.spawn, game);
            let result = null;
            if (shouldSpawn) {
                result = role.spawn(this.spawn, game);

                if (role.isPrioritySpawn() && result !== OK) {
                    Logger.info(`Priority role ${role.constructor.name} spawn failed with ${result}`);

                    return;
                } else if (result === OK) {
                    Logger.debug(`Spawning ${role.constructor.name}`);
                } else {
                    Logger.debug(`Not spawning ${role.constructor.name} with ${result}`);
                }
            } else {
                Logger.debug(`Not spawning ${role.constructor.name}`);
            }
        }
    }
}
