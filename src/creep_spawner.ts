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

    run(): void {
        if (this.spawn.spawning !== null) {
            return;
        }

        for (let role of this.roles) {
            const shouldSpawn = role.getSpawnStrategy().shouldSpawn(this.spawn);
            let result = null;
            if (shouldSpawn) {
                result = role.spawn(this.spawn);

                if (role.isPrioritySpawn(this.spawn) && result !== OK) {
                    Logger.info(`[${this.spawn.room.name}] Priority role ${role.constructor.name} spawn failed with ${result}`);

                    return;
                } else if (result === OK) {
                    Logger.debug(`[${this.spawn.room.name}] Spawning ${role.constructor.name}`);
                } else {
                    Logger.debug(`[${this.spawn.room.name}] Not spawning ${role.constructor.name} with ${result}`);
                }
            } else {
                Logger.debug(`[${this.spawn.room.name}] Not spawning ${role.constructor.name}`);
            }
        }
    }
}
