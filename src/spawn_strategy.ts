export default interface SpawnStrategy {
    shouldSpawn(spawn: StructureSpawn, game: Game): boolean
}
