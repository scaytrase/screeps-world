import Logger from "./logger";
import Role from "./role";
import SpawnStrategy from "./spawn_strategy";
import Utils from "./utils";

export default abstract class BaseCreepRole implements Role {
    public abstract getSpawnStrategy(): SpawnStrategy;

    public match(creep: Creep): boolean {
        return creep.memory['role'] == this.getRoleName();
    }

    public abstract run(creep: Creep): void;

    public spawn(spawn: StructureSpawn): ScreepsReturnCode {
        try {
            const body = this.getBody(spawn);
            const cost = Utils.getBodyCost(body);
            // const room = spawn.room;
            const room = Game.rooms[spawn.room.name];
            const energy = room.energyAvailable;

            if (!Utils.isCapableToSpawnBodyNow(spawn, body)) {
                Logger.warn(`${room.name}] [${this.constructor.name}] No energy for body ${JSON.stringify(body)} (${energy} < ${cost} ${Math.round(energy / cost * 100)}%)`);

                return ERR_NOT_ENOUGH_ENERGY;
            }

            Logger.debug(`[${room.name}] [${this.constructor.name}] Trying to spawn ${JSON.stringify(body)} for ${cost} having ${energy} ${Math.round(energy / cost * 100)}%)`);

            return Game.spawns[spawn.name].spawnCreep(
                body,
                this.getName(),
                {memory: {role: this.getRoleName(), ...this.getSpawnMemory(spawn)}}
            );
        } catch (e) {
            console.log(JSON.stringify(e));
        }
    }

    public abstract getRoleName(): string;

    public isPrioritySpawn(spawn: StructureSpawn): boolean {
        return false;
    }

    protected isSpawnBound(): boolean {
        return true;
    }

    protected getSpawnMemory(spawn: StructureSpawn): object {
        return {
            spawn: this.isSpawnBound() ? spawn.id : undefined
        };
    }

    protected abstract getBody(spawn: StructureSpawn): BodyPartConstant[];

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
