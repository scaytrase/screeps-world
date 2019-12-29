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
        const cost = Utils.getBodyCost(this.getBody(game, spawn));
        const energy = spawn.room.energyAvailable;
        if (!Utils.isCapableToSpawnBodyNow(spawn, this.getBody(game, spawn))) {
            console.log(`[WARN] [${spawn.room.name}] Not enough energy to spawn ${this.constructor.name} body (${energy} < ${cost})`);
        }

        return spawn.spawnCreep(
            this.getBody(game, spawn),
            this.getName(game),
            {memory: {role: this.getRoleName(), ...this.getSpawnMemory(spawn, game)}}
        );
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
