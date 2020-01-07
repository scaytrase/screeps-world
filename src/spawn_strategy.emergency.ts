import SpawnStrategy from "./spawn_strategy";

export default class EmergencySpawnStrategy implements SpawnStrategy {
    private readonly emergencyCheck: (spawn: StructureSpawn) => boolean;

    constructor(check: (spawn: StructureSpawn) => boolean) {
        this.emergencyCheck = check;
    }

    shouldSpawn(spawn: StructureSpawn): boolean {
        return this.emergencyCheck(spawn);
    }
}
