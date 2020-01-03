import Role from "./role";
import SpawnStrategy from "./spawn_strategy";
import Utils from "./utils";

export default abstract class BaseCreepRole implements Role {
    public abstract getSpawnStrategy(): SpawnStrategy;

    public match(creep: Creep): boolean {
        return creep.memory['role'] == this.getRoleName();
    }

    public abstract run(creep: Creep, game: Game): void;

    public spawn(spawn: StructureSpawn, game: Game): ScreepsReturnCode {
        try {
            const body = this.getBody(game, spawn);
            const cost = Utils.getBodyCost(body);
            // const room = spawn.room;
            const room = game.rooms[spawn.room.name];
            const energy = room.energyAvailable;

            if (!Utils.isCapableToSpawnBodyNow(spawn, body)) {
                console.log(`[WARN ] [${room.name}] [${this.constructor.name}] No energy for body ${JSON.stringify(body)} (${energy} < ${cost} ${Math.round(energy / cost * 100)}%)`);

                return ERR_NOT_ENOUGH_ENERGY;
            }

            console.log(`[DEBUG] [${room.name}] [${this.constructor.name}] Trying to spawn ${JSON.stringify(body)} for ${cost} having ${energy} ${Math.round(energy / cost * 100)}%)`);

            return game.spawns[spawn.name].spawnCreep(
                body,
                this.getName(game),
                {memory: {role: this.getRoleName(), ...this.getSpawnMemory(spawn, game)}}
            );
        } catch (e) {
            console.log(JSON.stringify(e));
        }
    }

    public isPrioritySpawn(spawn: StructureSpawn, game: Game): boolean {
        return false;
    }

    protected isSpawnBound(): boolean {
        return true;
    }

    protected getSpawnMemory(spawn: StructureSpawn, game: Game): object {
        return {
            spawn: this.isSpawnBound() ? spawn.id : undefined
        };
    }

    protected abstract getRoleName(): string;

    protected abstract getBody(game: Game, spawn: StructureSpawn): BodyPartConstant[];

    private getName(game: Game): string {
        let i = 0;
        while (game.creeps[this.generateName(game, i)] !== undefined) {
            i++;
        }

        return this.generateName(game, i);
    }

    private generateName(game: Game, i: number): string {
        return `${this.getRoleName()}_` + i;
    }
}
