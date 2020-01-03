import {BASE_WORKER_CREEP_BODY, MAX_WORK_PER_RESOURCE, RESOURCE_ASSIGN_ALGO_VERSION, WORKER_BODIES} from "./config";
import CreepTrait from "./creep_traits";
import Economy from "./economy";
import ResourceAssigner from "./resource_assigner";
import StorageLinkKeeperRole from "./role.storage_link_keeper";
import WorkRestCycleCreepRole from "./role.work_rest_cycle_creep";
import SpawnStrategy from "./spawn_strategy";
import Utils from "./utils";

const STORAGE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_LINK,
    STRUCTURE_SPAWN,
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_EXTENSION,
];

export default class HarvesterRole extends WorkRestCycleCreepRole<Source> {
    private static getRecipientStructures(creep: Creep, game: Game): StructureConstant[] {
        if (Economy.isHarvesterEmergency(creep.room, game) && Utils.findCreepsByRole(game, new StorageLinkKeeperRole(), creep.room).length === 0) {
            return [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER];
        } else if (Economy.isHarvesterEmergency(creep.room, game)) {
            return [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER, STRUCTURE_LINK];
        } else {
            return STORAGE_STRUCTURES;
        }
    }

    private static getRecipient(creep: Creep, game: Game) {
        const recipient = Utils.getClosestEnergyRecipient(creep, HarvesterRole.getRecipientStructures(creep, game), creep.store.getUsedCapacity());

        if (recipient) {
            return recipient;
        }

        return Utils.getClosestEnergyRecipient(creep, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER]);
    }

    public isPrioritySpawn(spawn: StructureSpawn, game: Game): boolean {
        return Utils.findCreepsByRole(game, this, spawn.room).length < spawn.room.find(FIND_SOURCES).length;
    }

    public getSpawnStrategy(): SpawnStrategy {
        return {
            shouldSpawn(spawn: StructureSpawn, game: Game): boolean {
                const resource = ResourceAssigner.getResource(spawn.room);
                if (!resource) {
                    return false;
                }

                const walkable = Utils.getWalkablePositionsAround(resource);
                const harvesting = ResourceAssigner.getCurrentHarvesters(resource).length;

                return harvesting < walkable;
            }
        };
    }

    protected getSpawnMemory(spawn: StructureSpawn, game: Game): object {
        return {...super.getSpawnMemory(spawn, game), target: ResourceAssigner.getResource(spawn.room).id};
    }

    protected shouldWork(creep: Creep, game: Game): boolean {
        const target = this.getCurrentStructureTarget(creep);
        return creep.store.getUsedCapacity() === 0 && target && target.energy > 0;
    }

    protected shouldRest(creep: Creep, game: Game): boolean {
        const target = this.getCurrentStructureTarget(creep);
        return creep.store.getFreeCapacity() === 0 || !target || target.energy === 0;
    }

    protected work(creep: Creep, game: Game): void {
        CreepTrait.harvest(creep, this.getCurrentStructureTarget(creep));
    }

    protected rest(creep: Creep, game: Game): void {
        CreepTrait.transferAllEnergy(creep, HarvesterRole.getRecipient(creep, game));
    }

    protected shouldRenewTarget(creep: Creep, game: Game): boolean {
        const oldVersion = creep.memory['version'] === undefined || creep.memory['version'] !== RESOURCE_ASSIGN_ALGO_VERSION;
        if (oldVersion) {
            return true;
        }
        const target = this.getCurrentStructureTarget(creep);
        if (!target) {
            return true;
        }

        return target.room.name !== creep.room.name;
    }

    protected setTarget(creep: Creep, target: Source | null): void {
        creep.memory['version'] = RESOURCE_ASSIGN_ALGO_VERSION;
        super.setTarget(creep, target);
    }

    protected getTarget(creep: Creep, game: Game): Source {
        let room = creep.room;
        if (creep.memory['spawn'] !== undefined) {
            room = Game.getObjectById<StructureSpawn>(creep.memory['spawn']).room;
        }

        return ResourceAssigner.getResource(room);
    }

    protected getBody(game: Game, spawn: StructureSpawn): BodyPartConstant[] {
        const harvesterBodies = WORKER_BODIES.filter(body => body.filter(part => part === WORK).length <= MAX_WORK_PER_RESOURCE);
        if (this.isPrioritySpawn(spawn, game)) {
            return Utils.getBiggerPossibleBodyNow(harvesterBodies, BASE_WORKER_CREEP_BODY, spawn);
        }

        return Utils.getBiggerPossibleBody(harvesterBodies, BASE_WORKER_CREEP_BODY, spawn);
    }

    protected getRoleName(): string {
        return 'harvester';
    }
}
