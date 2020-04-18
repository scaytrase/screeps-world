import Logger from "../utils/logger";
import Role from "../role";
import SpawnStrategy from "../spawn_strategy";
import Utils from "../utils/utils";

export default class RoleCountStrategy implements SpawnStrategy {
    private readonly limit: number;
    private readonly role: Role;
    private readonly allRooms: boolean;

    private constructor(limit: number, role: Role, allRooms: boolean = false) {
        this.limit = limit;
        this.role = role;
        this.allRooms = allRooms;
    }

    public static global(limit: number, role: Role) {
        return new RoleCountStrategy(limit, role, true);
    }

    public static room(limit: number, role: Role) {
        return new RoleCountStrategy(limit, role, false);
    }

    shouldSpawn(spawn: StructureSpawn): boolean {
        const desired = this.limit;

        const current = Utils
            .findCreepsByRole(this.role, this.allRooms ? null : spawn.room)
            .filter(Utils.filterDeadCreeps)
            .length;

        Logger.debug(`[${spawn.room.name}]`, this.role.constructor.name, current, desired);
        return current < desired;
    }
}
