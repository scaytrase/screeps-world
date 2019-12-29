import {SUICIDE_TTL} from "./config";
import Role from "./role";
import SpawnStrategy from "./spawn_strategy";
import Utils from "./utils";

export default class LimitedSpawnByRoleCountStrategy implements SpawnStrategy {
    private readonly limit: number;
    private readonly role: Role;
    private readonly multiplier: (spawn: StructureSpawn) => number;

    constructor(limit: number, role: Role, multiplier?: (spawn: StructureSpawn) => number) {
        this.limit = limit;
        this.role = role;
        if (multiplier === undefined) {
            multiplier = () => 1;
        }
        this.multiplier = multiplier;
    }

    shouldSpawn(spawn: StructureSpawn, game: Game): boolean {
        const multiplier = this.multiplier(spawn);
        const desired = this.limit;
        const current = Utils.findCreepsByRole(game, this.role, spawn.room)
            .filter(creep => creep.ticksToLive > SUICIDE_TTL)
            .length;

        console.log(spawn.room.name, this.role.constructor.name, current, desired, multiplier);
        return current < (desired * multiplier);
    }
}
