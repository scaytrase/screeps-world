import GameCache from "../utils/cache";
import {MAX_WORK_PER_RESOURCE, RESOURCE_ASSIGN_ALGO_VERSION, RESOURCE_CACHE_TTL} from "../config/config";
import {BASE_WORKER_CREEP_BODY, WORKER_BODIES} from "../config/const";
import CreepTrait from "../creep_traits";
import Economy from "../economy";
import ResourceAssigner from "../activities/resource_assigner";
import StorageLinkKeeperRole from "./storage_link_keeper";
import WorkRestCycleCreepRole from "../base_roles/work_rest_cycle_creep";
import SpawnStrategy from "../spawn_strategy";
import Utils from "../utils/utils";

const STORAGE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_LINK,
    STRUCTURE_SPAWN,
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_EXTENSION,
];

export default class HarvesterRole extends WorkRestCycleCreepRole<Source> {
    public static resource_cache: GameCache<Source | undefined> = new GameCache<Source | undefined>();

    public static getResource(room: Room): Source | undefined {
        return HarvesterRole.resource_cache.getCached(room.name, RESOURCE_CACHE_TTL, () => ResourceAssigner.getResource(room));
    }

    public static getCurrentHarvesters(resource: Source): Creep[] {
        return resource.room
            .find(FIND_MY_CREEPS)
            .filter(Utils.filterDeadCreeps)
            .filter(creep => creep.memory['target'] === resource.id);
    }

    private static getRecipientStructures(creep: Creep): StructureConstant[] {
        if (Economy.isHarvesterEmergency(creep.room) && Utils.findCreepsByRole(new StorageLinkKeeperRole(), creep.room).length === 0) {
            return [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER];
        } else if (Economy.isHarvesterEmergency(creep.room)) {
            return [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER, STRUCTURE_LINK];
        } else {
            return STORAGE_STRUCTURES;
        }
    }

    private static getRecipient(creep: Creep) {
        const recipient = Utils.getClosestEnergyRecipient2(creep, HarvesterRole.getRecipientStructures(creep), creep.store.getUsedCapacity());

        if (recipient) {
            return recipient;
        }

        return Utils.getClosestEnergyRecipient2(creep, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER]);
    }

    public spawn(spawn: StructureSpawn): ScreepsReturnCode | null {
        const result = super.spawn(spawn);

        if (result === OK) {
            HarvesterRole.resource_cache.delete(spawn.room.name);
        }

        return result;
    }

    public isPrioritySpawn(spawn: StructureSpawn): boolean {
        return Utils.findCreepsByRole(this, spawn.room).length < spawn.room.find(FIND_SOURCES).length;
    }

    public getSpawnStrategy(): SpawnStrategy {
        return {
            shouldSpawn(spawn: StructureSpawn): boolean {
                const resource = HarvesterRole.getResource(spawn.room);
                if (!resource) {
                    return false;
                }

                const walkable = Utils.getWalkablePositionsAround(resource);
                const harvesting = HarvesterRole.getCurrentHarvesters(resource).length;

                return harvesting < walkable;
            }
        };
    }

    public getCurrentWork(resource: Source) {
        const creeps = HarvesterRole.getCurrentHarvesters(resource);
        return creeps
            .map(creep => Utils.countCreepBodyParts(creep, WORK))
            .reduce((p, v) => p + v, 0);
    }

    public getRoleName(): string {
        return 'harvester';
    }

    protected getDefaultMemory(spawn: StructureSpawn): object {
        return {...super.getDefaultMemory(spawn), target: HarvesterRole.getResource(spawn.room).id};
    }

    protected shouldWork(creep: Creep): boolean {
        const target = this.getCurrentStructureTarget(creep);
        return creep.store.getUsedCapacity() === 0 && target && target.energy > 0;
    }

    protected shouldRest(creep: Creep): boolean {
        const target = this.getCurrentStructureTarget(creep);
        return creep.store.getFreeCapacity() === 0 || !target || target.energy === 0;
    }

    protected work(creep: Creep): void {
        const target = this.getCurrentStructureTarget(creep);

        if (target.energy > 0) {
            CreepTrait.harvest(creep, target);
        }
    }

    protected rest(creep: Creep): void {
        CreepTrait.transferAllEnergy(creep, HarvesterRole.getRecipient(creep));
    }

    protected shouldRenewTarget(creep: Creep): boolean {
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

    protected getTarget(creep: Creep): Source {
        let room = creep.room;
        if (creep.memory['spawn'] !== undefined) {
            const spawn = Game.getObjectById<StructureSpawn>(creep.memory['spawn']);
            if (spawn) {
                room = spawn.room;
            }
        }

        return HarvesterRole.getResource(room);
    }

    protected getBody(spawn: StructureSpawn): BodyPartConstant[] {
        const resource = HarvesterRole.getResource(spawn.room);
        if (resource === undefined) {
            return BASE_WORKER_CREEP_BODY;
        }

        const harvesterBodies = WORKER_BODIES.filter(body => body.filter(part => part === WORK).length <= this.getMaxWorkPerBody(resource));

        if (this.isPrioritySpawn(spawn)) {
            return Utils.getBiggerPossibleBodyNow(harvesterBodies, BASE_WORKER_CREEP_BODY, spawn);
        }

        return Utils.getBiggerPossibleBody(harvesterBodies, BASE_WORKER_CREEP_BODY, spawn);
    }

    private getMaxWorkPerBody(resource: Source): number {
        const current = this.getCurrentWork(resource);

        return Math.max(0, MAX_WORK_PER_RESOURCE - current) + 1;
    }
}
