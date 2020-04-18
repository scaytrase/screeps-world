import {
    REPAIRER_HEALTH_EMERGENCY_RATIO,
    REPAIRER_HEALTH_LOWER_RATIO,
    REPAIRER_HEALTH_UPPER_RATIO,
    REPAIRERS_COUNT_LIMIT
} from "../config/config";
import {BASE_WORKER_CREEP_BODY, WORKER_BODIES} from "../config/const";
import CreepTrait from "../creep_traits";
import EconomyUtils from "../utils/economy_utils";
import WorkRestCycleCreepRole from "../base_roles/work_rest_cycle_creep";
import {Sort} from "../utils/sort_utils";
import SpawnStrategy from "../spawn_strategy";
import AndChainSpawnStrategy from "../spawn_strategy/and_chain";
import RoomFindSpawnStrategy from "../spawn_strategy/room_find";
import Utils from "../utils/utils";

const FORBIDDEN_STRUCTURES: StructureConstant[] = [
    STRUCTURE_WALL,
    STRUCTURE_RAMPART,
];

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_LINK,
    STRUCTURE_SPAWN,
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_TERMINAL,
];

export default class RepairerRole extends WorkRestCycleCreepRole<AnyStructure> {
    private static filter(object) {
        return !FORBIDDEN_STRUCTURES.includes(object.structureType) &&
            ((object.hits / object.hitsMax) < REPAIRER_HEALTH_LOWER_RATIO);
    }

    public getSpawnStrategy(): SpawnStrategy {
        const that = this;
        return new AndChainSpawnStrategy([
            new RoomFindSpawnStrategy(FIND_STRUCTURES, {filter: RepairerRole.filter}),
            {
                shouldSpawn(spawn: StructureSpawn): boolean {
                    const towers = spawn.room
                        .find(FIND_MY_STRUCTURES, {
                            // @ts-ignore
                            filter: (structure: StructureTower) => structure.structureType === STRUCTURE_TOWER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 500
                        }).length;
                    if (towers > 1) {
                        return false;
                    }
                    const creeps = Utils.findCreepsByRole(that, spawn.room).length;
                    if (towers === 1) {
                        return creeps < 1;
                    }

                    return creeps < REPAIRERS_COUNT_LIMIT;
                }
            },
        ]);
    }

    public isPrioritySpawn(spawn: StructureSpawn): boolean {
        return this.isEmergency(spawn.room) && EconomyUtils.usableSpawnEnergyAvailable(spawn.room) > 2000;
    }

    public getRoleName(): string {
        return 'repairer';
    }

    protected shouldRenewTarget(creep: Creep): boolean {
        const current = this.getCurrentStructureTarget(creep);

        if (!current) {
            return true;
        }
        const emergency = this.isEmergency(creep.room);

        const hitsRation = current.hits / current.hitsMax;

        if (hitsRation > REPAIRER_HEALTH_LOWER_RATIO * 1.05 && emergency) {
            return true;
        }

        return (hitsRation) > REPAIRER_HEALTH_UPPER_RATIO;
    }

    protected getTarget(creep: Creep): AnyStructure | null {
        return creep.room
            .find(FIND_STRUCTURES, {filter: RepairerRole.filter})
            .sort(Sort.byHealthPercent())
            .shift();
    }

    protected getBody(spawn: StructureSpawn): BodyPartConstant[] {
        if (this.isPrioritySpawn(spawn)) {
            return Utils.getBiggerPossibleBodyNow(WORKER_BODIES, BASE_WORKER_CREEP_BODY, spawn);
        }

        return Utils.getBiggerPossibleBody(WORKER_BODIES, BASE_WORKER_CREEP_BODY, spawn);
    }

    protected rest(creep: Creep): void {
        CreepTrait.withdrawAllEnergy(creep, Utils.getClosestEnergySource(creep, SOURCE_STRUCTURES, 200));
    }

    protected shouldRest(creep: Creep): boolean {
        return creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0;
    }

    protected shouldWork(creep: Creep): boolean {
        return creep.store.getFreeCapacity() === 0;
    }

    protected work(creep: Creep): void {
        CreepTrait.build(creep, this.getCurrentStructureTarget(creep));
    }

    private isEmergency(room: Room) {
        const emergencyFilter = object => !FORBIDDEN_STRUCTURES.includes(object.structureType) &&
            ((object.hits / object.hitsMax) < REPAIRER_HEALTH_EMERGENCY_RATIO);

        return room.find(FIND_STRUCTURES, {filter: emergencyFilter}).length > 0;
    }
}
