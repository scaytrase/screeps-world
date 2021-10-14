import {
    BUILD_REMOTE_ROOMS_UP_ENERGY_CURRENT,
    BUILD_REMOTE_ROOMS_UP_ENERGY_MAX,
    BUILD_REMOTE_ROOMS_UP_TO_LEVEL,
    MIN_ECONOMY_FOR_REMOTE_CREEP_PRODUCERS,
    REMOTE_BUILDERS_COUNT_LIMIT
} from "../config/config";
import {BASE_WORKER_CREEP_BODY, WORKER_BODIES} from "../config/const";
import CreepTrait from "../creep_traits";
import WorkRestCycleCreepRole from "../base_roles/work_rest_cycle_creep";
import {Sort} from "../utils/sort_utils";
import SpawnStrategy from "../spawn_strategy";
import AndChainSpawnStrategy from "../spawn_strategy/and_chain";
import NotEmptyCallableResult from "../spawn_strategy/not_empty_callable_result";
import RoleCountStrategy from "../spawn_strategy/role_count";
import Utils from "../utils/utils";

export default class RemoteBuilderRole extends WorkRestCycleCreepRole<ConstructionSite> {
    public getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy([
            RoleCountStrategy.global(REMOTE_BUILDERS_COUNT_LIMIT, this),
            new NotEmptyCallableResult((spawn) => this.getSites().shift()),
            new NotEmptyCallableResult((spawn) => spawn.room.storage && spawn.room.storage.store.getUsedCapacity() > MIN_ECONOMY_FOR_REMOTE_CREEP_PRODUCERS),
        ]);
    }

    public getRoleName(): string {
        return 'remote_builder';
    }

    protected isSpawnBound(): boolean {
        return false;
    }

    protected shouldWork(creep: Creep): boolean {
        return creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0;
    }

    protected shouldRest(creep: Creep): boolean {
        return creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
    }

    protected work(creep: Creep): void {
        CreepTrait.build(creep, this.getCurrentStructureTarget(creep));
    }

    protected rest(creep: Creep): void {
        const source = Utils.getClosestEnergySource(creep, [STRUCTURE_STORAGE, STRUCTURE_CONTAINER]);
        const grave = Utils.getRoomGraves(creep.room).shift();
        const closestEnergyMine = Utils.getClosestEnergyMine(creep);

        if (grave) {
            CreepTrait.pickupAllEnergy(creep, grave);
        } else if (creep.pos.getRangeTo(source) < creep.pos.getRangeTo(closestEnergyMine)) {
            CreepTrait.withdrawAllEnergy(creep, source);
        } else {
            CreepTrait.harvest(creep, closestEnergyMine);
        }
    }

    protected shouldRenewTarget(creep: Creep): boolean {
        const target = this.getCurrentStructureTarget(creep);

        const newTarget = this.getTarget(creep);

        return target === undefined || target === null || newTarget !== target || !(target instanceof ConstructionSite);
    }

    protected getTarget(creep: Creep): ConstructionSite | null {
        return this.findPrioritySite(creep, this.getSites());
    }

    protected getBody(spawn: StructureSpawn): BodyPartConstant[] {
        return Utils.getBiggerPossibleBody(WORKER_BODIES, BASE_WORKER_CREEP_BODY, spawn);
    }

    private findPrioritySite(creep: Creep, sites: ConstructionSite[]): ConstructionSite
    {
        for (let site of sites) {
            if (site.structureType === 'spawn') {
                return site;
            }

            if (site.structureType === 'storage') {
                return site;
            }

            if (site.structureType === 'tower') {
                return site;
            }

            if (site.structureType === 'extension') {
                return site;
            }

            if (site.structureType === 'link') {
                return site;
            }

            if (site.structureType === 'container') {
                return site;
            }
        }

        return sites.sort(Sort.byDistance(creep)).shift();
    }

    private getSites(): ConstructionSite[] {
        let sites = [];
        for (const siteName in Game.constructionSites) {
            const site = Game.constructionSites[siteName];

            if (site.room.find(FIND_MY_SPAWNS).length === 0
                || site.room.energyCapacityAvailable < BUILD_REMOTE_ROOMS_UP_ENERGY_MAX
                || site.room.energyAvailable < BUILD_REMOTE_ROOMS_UP_ENERGY_CURRENT
                || site.room.controller.level < BUILD_REMOTE_ROOMS_UP_TO_LEVEL
            ) {
                sites.push(site);
            }
        }
        return sites;
    }
}
