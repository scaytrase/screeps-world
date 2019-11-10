import SpawnStrategy from "./spawn_strategy";
import Role from "./role";

const _ = require('lodash');

export default class LimitedSpawnByRoleCountStrategy implements SpawnStrategy {
    private readonly limit: Number;
    private readonly role: Role;

    constructor(limit: Number, role: Role) {
        this.limit = limit;
        this.role = role;
    }

    shouldSpawn(game: Game): boolean {
        return _.filter(game.creeps, (creep: Creep) => this.role.match(creep)).length < this.limit;
    }
}
