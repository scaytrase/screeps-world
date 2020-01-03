import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";

export default class RoomClaimerRole extends BaseCreepRole {
    private readonly flag: Flag;

    constructor(flag: Flag) {
        super();
        this.flag = flag;
    }

    public getSpawnStrategy(): SpawnStrategy {
        if (this.flag.room && (this.flag.room.controller.upgradeBlocked || this.flag.room.controller.my)) {
            return {
                shouldSpawn(spawn: StructureSpawn, game: Game): boolean {
                    return false;
                }
            };
        }
        return new LimitedSpawnByRoleCountStrategy(1, this);
    }

    public run(creep: Creep, game: Game): void {
        const room = this.flag.room;
        if (room) {
            const controller = room.controller;
            if (!creep.pos.isNearTo(controller)) {
                creep.moveTo(controller);
            } else {
                creep.claimController(controller);
            }
        } else {
            creep.moveTo(this.flag);
        }
    }

    protected isSpawnBound(): boolean {
        return false;
    }

    protected getBody(game: Game, spawn: StructureSpawn): BodyPartConstant[] {
        return [CLAIM, MOVE];
    }

    protected getRoleName(): string {
        return `claimer_${this.flag.name}`;
    }
}
