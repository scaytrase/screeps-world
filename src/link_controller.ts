import Runnable from "./runnable";

export default class LinkController implements Runnable {
    private readonly spawn: StructureSpawn;

    constructor(spawn: StructureSpawn) {
        this.spawn = spawn;
    }

    run(game: Game, memory: Memory): void {
        let links = this.spawn.room.find<StructureLink>(FIND_STRUCTURES, {filter: (structure) => structure.structureType === STRUCTURE_LINK});

        if (links.length < 2) {
            return;
        }

        links = links.sort((a, b) => Math.sign(a.pos.getRangeTo(this.spawn) - b.pos.getRangeTo(this.spawn)));

        const target = links.shift();

        for (let source of links) {
            source.transferEnergy(target);
        }
    }
}
