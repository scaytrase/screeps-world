import Runnable from "./runnable";
import Role from "./role";

export default class CreepRunner implements Runnable {
    private readonly roles: Array<Role>;

    constructor(roles: Array<Role>) {
        this.roles = roles;
    }

    run(game: Game, memory: Memory): void {
        for (let name in game.creeps) {
            let creep = game.creeps[name];

            if (creep.spawning) {
                continue;
            }

            for (let role of this.roles) {
                if (role.match(creep)) {
                    role.run(creep);
                }
            }
        }
    }
}
