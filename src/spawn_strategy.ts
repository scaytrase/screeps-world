export default interface SpawnStrategy {
    shouldSpawn(spawn: StructureSpawn): boolean
}
