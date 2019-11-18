import Role from "./role";
import SpawnStrategy from "./spawn_strategy";

export default abstract class BaseCreepRole implements Role {
    abstract getSpawnStrategy(): SpawnStrategy;

    match(creep: Creep): boolean {
        return creep.memory['role'] == this.getRoleName();
    }

    abstract run(creep: Creep, game: Game): void;

    spawn(spawn: StructureSpawn, game: Game): void {
        spawn.spawnCreep(
            this.getBody(game),
            this.getName(game),
            {memory: {role: this.getRoleName()}}
        );
    }

    protected abstract getRoleName(): string;

    protected abstract getBody(game: Game): BodyPartConstant[];

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
