import {SUICIDE_TTL} from "./config";
import Role from "./role";
import SpawnStrategy from "./spawn_strategy";
import Utils from "./utils";

export default class LimitedSpawnByRoleCountStrategy implements SpawnStrategy {
    private readonly limit: Number;
    private readonly role: Role;

    constructor(limit: Number, role: Role) {
        this.limit = limit;
        this.role = role;
    }

    shouldSpawn(spawn: StructureSpawn, game: Game): boolean {
        return Utils.findCreepsByRole(game, this.role).filter(creep => creep.ticksToLive > SUICIDE_TTL).length < this.limit;
    }
}
