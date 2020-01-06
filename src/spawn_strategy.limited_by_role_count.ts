import {SUICIDE_TTL} from "./config";
import Logger from "./logger";
import Role from "./role";
import SpawnStrategy from "./spawn_strategy";
import Utils from "./utils";

export default class LimitedSpawnByRoleCountStrategy implements SpawnStrategy {
    private readonly limit: number;
    private readonly role: Role;
    private readonly multiplier: (spawn: StructureSpawn) => number;
    private readonly allRooms: boolean;

    constructor(limit: number, role: Role, multiplier?: (spawn: StructureSpawn) => number, allRooms: boolean = false) {
        this.limit = limit;
        this.role = role;
        this.allRooms = allRooms;
        if (multiplier === undefined) {
            multiplier = () => 1;
        }
        this.multiplier = multiplier;
    }

    shouldSpawn(spawn: StructureSpawn, game: Game): boolean {
        const multiplier = this.multiplier(spawn);
        const desired = this.limit;
        const ttl = SUICIDE_TTL;

        const current = Utils.findCreepsByRole(game, this.role, this.allRooms ? null : spawn.room)
            .filter(creep => creep.ticksToLive > ttl)
            .filter(creep => creep.memory['spawn'] === undefined || creep.memory['spawn'] === spawn.id)
            .length;

        Logger.debug(`[${spawn.room.name}]`, this.role.constructor.name, current, desired, multiplier);
        return current < (desired * multiplier);
    }
}
