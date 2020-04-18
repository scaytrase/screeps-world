import Logger from "../utils/logger";
import Role from "../role";
import Activity from "../activity";

export default class CreepSpawner implements Activity {
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
            const result = role.spawn(this.spawn);

            if (role.isPrioritySpawn(this.spawn) && result !== OK) {
                Logger.info(`[${this.spawn.room.name}] Priority role ${role.constructor.name} spawn failed with ${result}`);

                break;
            } else if (result === OK) {
                Logger.debug(`[${this.spawn.room.name}] Spawning ${role.constructor.name}`);
            } else {
                Logger.debug(`[${this.spawn.room.name}] Not spawning ${role.constructor.name} with ${result}`);
            }
        }
    }
}
