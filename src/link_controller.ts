import {ENERGY_CENTER, UPGRADE_LINK} from "./config";
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

        const flag = Utils.getFlagByName(ENERGY_CENTER, this.spawn.room);

        if (!flag) {
            return;
        }

        links = links.sort(Utils.sortByDistance(flag));

        const target = links.shift();

        for (let source of links) {
            // @ts-ignore
            if (source.store.getUsedCapacity() >= 0) {
                source.transferEnergy(target);
            }
        }
    }
}
