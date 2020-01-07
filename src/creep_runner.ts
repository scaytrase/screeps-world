import Role from "./role";
import Runnable from "./runnable";

export default class CreepRunner implements Runnable {
    private readonly roles: Map<string, Role> = new Map<string, Role>();

    constructor(roles: Array<Role>) {
        for (const role of roles) {
            this.roles.set(role.getRoleName(), role);
        }
    }

    run(): void {
        for (const creep of Object.values(Game.creeps)) {
            if (creep.spawning) {
                continue;
            }

            if (creep.memory['sleep_until'] && creep.memory['sleep_until'] > Game.time) {
                continue;
            }

            const role = this.roles.get(creep.memory['role']);

            if (!role) {
                continue;
            }

            role.run(creep);
        }
    }
}
