import Logger from "../utils/logger";
import Role from "../role";
import SpawnStrategy from "../spawn_strategy";
import Utils from "../utils/utils";
import ProtoCreep from "../proto_creep";

export default abstract class BaseCreepRole implements Role {
    public match(creep: Creep): boolean {
        return creep.memory['role'] == this.getRoleName();
    }

    public abstract run(creep: Creep): void;

    public spawn(_spawn: StructureSpawn): ScreepsReturnCode {
        const spawn = Game.spawns[_spawn.name];
        const prototype = this.createPrototype(spawn);

        if (prototype !== null) {
            try {
                const cost = Utils.getBodyCost(prototype.body);
                const room = Game.rooms[spawn.room.name];
                const energy = room.energyAvailable;

                if (!Utils.isCapableToSpawnBodyNow(spawn, prototype.body)) {
                    Logger.info(`[${room.name}] [${this.constructor.name}] No energy for body ${JSON.stringify(prototype.body)} (${energy} < ${cost} ${Math.round(energy / cost * 100)}%)`);

                    return ERR_NOT_ENOUGH_ENERGY;
                }

                Logger.debug(`[${room.name}] [${this.constructor.name}] Trying to spawn ${JSON.stringify(prototype.body)} for ${cost} having ${energy} ${Math.round(energy / cost * 100)}%)`);

                return spawn.spawnCreep(
                    prototype.body,
                    this.getName(),
                    {memory: prototype.memory}
                );
            } catch (e) {
                console.log(JSON.stringify(e));
            }
        } else {
            Logger.debug(`[${_spawn.room.name}] Not spawning ${this.getRoleName()}`);
        }
    }

    public abstract getRoleName(): string;

    public isPrioritySpawn(spawn: StructureSpawn): boolean {
        return false;
    }

    protected getSpawnStrategy(): SpawnStrategy {
        return new class implements SpawnStrategy {
            shouldSpawn(spawn: StructureSpawn): boolean {
                return false;
            }
        }
    };

    protected isSpawnBound(): boolean {
        return true;
    }

    protected getDefaultMemory(spawn: StructureSpawn): object {
        return {
            spawn: this.isSpawnBound() ? spawn.id : undefined,
            role: this.getRoleName(),
        };
    }

    protected createPrototype(spawn: StructureSpawn): ProtoCreep | null {
        if (this.getSpawnStrategy().shouldSpawn(spawn)) {
            return new ProtoCreep(this.getBody(spawn), this.getDefaultMemory(spawn));
        }

        return null;
    }

    protected getBody(spawn: StructureSpawn): BodyPartConstant[] {
        return []
    };

    private getName(): string {
        let i = 0;
        while (Game.creeps[this.generateName(i)] !== undefined) {
            i++;
        }

        return this.generateName(i);
    }

    private generateName(i: number): string {
        return `${this.getRoleName()}_` + i;
    }
}
