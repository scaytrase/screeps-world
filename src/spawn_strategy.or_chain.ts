import SpawnStrategy from "./spawn_strategy";

export default class OrChainSpawnStrategy implements SpawnStrategy {
    private readonly chain: SpawnStrategy[];

    constructor(chain: SpawnStrategy[]) {
        this.chain = chain;
    }

    shouldSpawn(spawn: StructureSpawn): boolean {
        for (let strategy of this.chain) {
            if (strategy.shouldSpawn(spawn)) {
                return true;
            }
        }

        return false;
    }
}
