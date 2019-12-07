import {ENERGY_PROVIDER, UPGRADE_LINK} from "./config";
import Runnable from "./runnable";
import Utils from "./utils";

export default class ProviderLinkController implements Runnable {
    private readonly spawn: StructureSpawn;

    constructor(spawn: StructureSpawn) {
        this.spawn = spawn;
    }

    run(game: Game, memory: Memory): void {
        const sourceFlag = Utils.getFlagByName(ENERGY_PROVIDER, this.spawn.room);
        const targetFlag = Utils.getFlagByName(UPGRADE_LINK, this.spawn.room);

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
