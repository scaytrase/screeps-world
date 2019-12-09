import {TOWER_ATTACK_BORDERS, TOWER_RANGE} from "./config";
import Runnable from "./runnable";
import Utils from "./utils";

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
            let hostiles = this.room.find(FIND_HOSTILE_CREEPS, {
                filter(creep) {
                    return creep.pos.getRangeTo(tower) < TOWER_RANGE && (TOWER_ATTACK_BORDERS || creep.owner.username === 'Invader' || Utils.isWithinTraversableBorders(creep));
                }
            });

            if (hostiles.length === 0) {
                this.heal(tower);
                return;
            }

            tower.attack(hostiles.shift());
        });
    }

    private heal(tower: StructureTower): void {
        let friends = this.room.find(FIND_MY_CREEPS, {
            filter(creep: Creep) {
                return creep.hits < creep.hitsMax;
            }
        });

        if (friends.length === 0) {
            return;
        }

        tower.heal(friends.shift());
    }
}
