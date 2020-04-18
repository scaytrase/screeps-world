import {SPAWN_KEEPERS_COUNT_LIMIT} from "../config/config";
import {BASE_CARRIER_CREEP_BODY, CARRIER_BODIES} from "../config/const";
import CreepTrait from "../creep_traits";
import WorkRestCycleCreepRole from "../base_roles/work_rest_cycle_creep";
import SpawnStrategy from "../spawn_strategy";
import AndChainSpawnStrategy from "../spawn_strategy/and_chain";
import OrChainSpawnStrategy from "../spawn_strategy/or_chain";
import RoleCountStrategy from "../spawn_strategy/role_count";
import RoomFindSpawnStrategy from "../spawn_strategy/room_find";
import Utils from "../utils/utils";
import {Sort} from "../utils/sort_utils";

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_LINK,
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_TERMINAL,
];

const PRIORITY_TARGET_STRUCTURES: StructureConstant[] = [
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
];

const TARGET_STRUCTURES: StructureConstant[] = [
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
    STRUCTURE_TOWER,
];

export default class SpawnKeeperRole extends WorkRestCycleCreepRole<StructureSpawn | StructureExtension | StructureTower> {
    public getSpawnStrategy(): SpawnStrategy {
        return new OrChainSpawnStrategy([
            new AndChainSpawnStrategy(
                [
                    RoleCountStrategy.room(SPAWN_KEEPERS_COUNT_LIMIT, this),
                    new RoomFindSpawnStrategy(FIND_STRUCTURES, {
                        filter: (structure) =>
                            structure.structureType === STRUCTURE_EXTENSION
                    }, 15)
                ]
            ),
            new AndChainSpawnStrategy(
                [
                    RoleCountStrategy.room(1, this),
                    new RoomFindSpawnStrategy(FIND_STRUCTURES, {
                        filter: (structure) =>
                            structure.structureType === STRUCTURE_EXTENSION ||
                            structure.structureType === STRUCTURE_CONTAINER ||
                            structure.structureType === STRUCTURE_STORAGE ||
                            structure.structureType === STRUCTURE_LINK
                    })
                ]
            )
        ]);
    }

    public isPrioritySpawn(spawn: StructureSpawn): boolean {
        return Utils.findCreepsByRole(this, spawn.room).length === 0;
    }

    public getRoleName(): string {
        return 'spawn_keeper';
    }

    protected getBody(spawn: StructureSpawn): BodyPartConstant[] {
        const bodies = CARRIER_BODIES.filter(body => body.filter(part => part === CARRY).length <= 10);

        return Utils.getBiggerPossibleBodyNow(bodies, BASE_CARRIER_CREEP_BODY, spawn);
    }

    protected getTarget(creep: Creep): StructureSpawn | StructureExtension | StructureTower {
        const target = Utils.getClosestEnergyRecipient2<StructureSpawn | StructureExtension>(creep, PRIORITY_TARGET_STRUCTURES);
        if (target && target.my) {
            return target;
        }

        return Utils.getClosestEnergyRecipient2(creep, TARGET_STRUCTURES);
    }

    protected rest(creep: Creep): void {
        const enemySource: Structure = creep.room.find(FIND_HOSTILE_STRUCTURES, {
            filter: (structure: StructureSpawn | StructureStorage | StructureContainer | StructureTower | StructureLink) =>
                ((structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE || structure.structureType === STRUCTURE_TOWER || structure.structureType === STRUCTURE_LINK)
                    // @ts-ignore
                    && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
        }).sort(Sort.byDistance(creep)).shift();
        if (enemySource) {
            CreepTrait.withdrawAllEnergy(creep, enemySource);
            return;
        }

        const energySource = Utils.getClosestEnergySource(creep, SOURCE_STRUCTURES);

        if (energySource && energySource.pos.getRangeTo(creep.pos) < 15) {
            CreepTrait.withdrawAllEnergy(creep, energySource);
        }

        this.renewTarget(creep);
    }

    protected shouldRenewTarget(creep: Creep): boolean {
        const target = this.getCurrentStructureTarget(creep);

        if (!target || !target.my) {
            return true;
        }

        if (!target.store) {
            console.log(target);

            return true;
        }

        return target.store.getFreeCapacity(RESOURCE_ENERGY) === 0;
    }

    protected shouldRest(creep: Creep): boolean {
        return creep.store.getUsedCapacity() == 0;
    }

    protected shouldWork(creep: Creep): boolean {
        return creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0;
    }

    protected work(creep: Creep): void {
        CreepTrait.transferAllEnergy(creep, this.getCurrentStructureTarget(creep));
    }
}
