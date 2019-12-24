import SpawnStrategy from "./spawn_strategy";

export default class EmergencySpawnStrategy implements SpawnStrategy {
    private readonly emergencyCheck: (spawn: StructureSpawn, game: Game) => boolean;

    constructor(check: (spawn: StructureSpawn, game: Game) => boolean) {
        this.emergencyCheck = check;
    }

    shouldSpawn(spawn: StructureSpawn, game: Game): boolean {
        return this.emergencyCheck(spawn, game);
    }
}
