import Runnable from "./runnable";

export default class TowerController implements Runnable {
    private room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    run(game: Game, memory: Memory): void {
        const towers = this.room.find(FIND_STRUCTURES, {
            filter(structure) {
                return structure.structureType === STRUCTURE_TOWER;
            }
        });

        towers.forEach((tower: StructureTower) => {
            const hostiles = this.room.find(FIND_HOSTILE_CREEPS, {
                filter(creep) {
                    return creep.pos.getRangeTo(tower) < 50;
                }
            });

            if (hostiles.length === 0) {
                return;
            }

            tower.attack(hostiles[0]);
        });
    }
}
