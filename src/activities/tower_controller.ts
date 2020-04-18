import {REPAIRER_HEALTH_LOWER_RATIO, TOWER_ATTACK_BORDERS, TOWER_RANGE} from "../config/config";
import Activity from "../activity";
import {Sort} from "../utils/sort_utils";
import Utils from "../utils/utils";

const FORBIDDEN_STRUCTURES: StructureConstant[] = [
    STRUCTURE_WALL,
    STRUCTURE_RAMPART,
];

export default class TowerController implements Activity {
    private room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    run(): void {
        const towers = this.room.find<StructureTower>(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});

        for (const tower of towers) {
            const hostiles = this.getHostiles(tower);
            if (hostiles.length > 0) {
                tower.attack(hostiles.shift());
                continue;
            }

            const friends = this.getDamagedFriends();
            if (friends.length > 0) {
                tower.heal(friends.shift());
                continue;
            }

            const structures = this.getDamagedStructures();
            if (structures.length > 0 && tower.energy > 800) {
                tower.repair(structures.sort(Sort.byHealthPercent()).shift());
            }
        }
    }

    private getHostiles(tower: StructureTower) {
        return this.room.find(FIND_HOSTILE_CREEPS, {
            filter: (creep) => creep.pos.getRangeTo(tower) < TOWER_RANGE && (TOWER_ATTACK_BORDERS || this.isInvader(creep) || Utils.isWithinTraversableBorders(creep))
        });
    }

    private isInvader(creep: Creep): boolean {
        return creep.owner.username === 'Invader';
    }

    private getDamagedFriends(): Creep[] {
        return this.room.find(FIND_MY_CREEPS, {
            filter(creep: Creep) {
                return creep.hits < creep.hitsMax;
            }
        });
    }


    private getDamagedStructures(): Structure[] {
        return this.room.find(FIND_STRUCTURES, {
            filter(structure: Structure) {
                return !FORBIDDEN_STRUCTURES.includes(structure.structureType) &&
                    structure.hits / structure.hitsMax < REPAIRER_HEALTH_LOWER_RATIO;
            }
        });
    }
}
