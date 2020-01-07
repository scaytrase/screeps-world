import SpawnStrategy from "./spawn_strategy";

export default class AndChainSpawnStrategy implements SpawnStrategy {
    private readonly chain: SpawnStrategy[];

    constructor(chain: SpawnStrategy[]) {
        this.chain = chain;
    }

    shouldSpawn(spawn: StructureSpawn): boolean {
        for (let strategy of this.chain) {
            if (!strategy.shouldSpawn(spawn)) {
                return false;
            }
        }

        return true;
    }
}
