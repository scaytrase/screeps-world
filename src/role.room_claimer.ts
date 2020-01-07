import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import RoleCountStrategy from "./spawn_strategy.role_count";

export default class RoomClaimerRole extends BaseCreepRole {
    private readonly flag: Flag;

    constructor(flag: Flag) {
        super();
        this.flag = flag;
    }

    public getSpawnStrategy(): SpawnStrategy {
        const flag = this.flag;

        return new AndChainSpawnStrategy([
            RoleCountStrategy.global(1, this),
            {
                shouldSpawn(spawn: StructureSpawn): boolean {
                    if (!flag.room) {
                        return true;
                    }

                    return !flag.room.controller.my;
                }
            }
        ]);
    }

    public run(creep: Creep): void {
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

    public getRoleName(): string {
        return `claimer_${this.flag.name}`;
    }

    protected isSpawnBound(): boolean {
        return false;
    }

    protected getSpawnMemory(spawn: StructureSpawn): object {
        return {...super.getSpawnMemory(spawn), immortal: true};
    }

    protected getBody(spawn: StructureSpawn): BodyPartConstant[] {
        return [CLAIM, MOVE];
    }
}
