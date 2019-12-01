import {UPGRADE_LINK} from "./config";
import Runnable from "./runnable";
import Utils from "./utils";

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

        const flag = Utils.getFlagByName(UPGRADE_LINK, this.spawn.room);

        if (!flag) {
            return;
        }

        links = links.sort(Utils.sortByDistance(flag));

        const target = links.shift();

        for (let source of links) {
            if (source['store'].getUsedCapacity(RESOURCE_ENERGY) >= 0) {
                source.transferEnergy(target);
            }
        }
    }
}
