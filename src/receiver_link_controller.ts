import {ENERGY_CENTER, ENERGY_SOURCE_1} from "./config";
import Runnable from "./runnable";
import Utils from "./utils";

export default class ReceiverLinkController implements Runnable {
    private readonly spawn: StructureSpawn;

    constructor(spawn: StructureSpawn) {
        this.spawn = spawn;
    }

    run(game: Game, memory: Memory): void {
        const sourceFlag = Utils.getFlagByName(ENERGY_SOURCE_1, this.spawn.room);
        const targetFlag = Utils.getFlagByName(ENERGY_CENTER, this.spawn.room);

        if (!sourceFlag || !targetFlag) {
            return;
        }

        const source = this.spawn.room
            .find<StructureLink>(FIND_STRUCTURES, {filter: (structure) => structure.structureType === STRUCTURE_LINK})
            .sort(Utils.sortByDistance(sourceFlag))
            .shift();

        const target = this.spawn.room
            .find<StructureLink>(FIND_STRUCTURES, {filter: (structure) => structure.structureType === STRUCTURE_LINK})
            .sort(Utils.sortByDistance(targetFlag))
            .shift();

        source.transferEnergy(target);
    }
}
