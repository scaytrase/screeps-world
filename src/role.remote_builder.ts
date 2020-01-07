import {
    BUILD_REMOTE_ROOMS_UP_TO_LEVEL,
    MIN_ECONOMY_FOR_REMOTE_CREEP_PRODUCERS,
    REMOTE_BUILDERS_COUNT_LIMIT
} from "./config";
import {BASE_WORKER_CREEP_BODY, WORKER_BODIES} from "./const";
import CreepTrait from "./creep_traits";
import WorkRestCycleCreepRole from "./role.work_rest_cycle_creep";
import {Sort} from "./sort_utils";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import NotEmptyCallableResult from "./spawn_strategy.not_empty_callable_result";
import RoleCountStrategy from "./spawn_strategy.role_count";
import Utils from "./utils";

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
        const closestEnergyMine = Utils.getClosestEnergyMine(creep);

        if (creep.pos.getRangeTo(source) < creep.pos.getRangeTo(closestEnergyMine)) {
            CreepTrait.withdrawAllEnergy(creep, source);
        } else {
            CreepTrait.harvest(creep, closestEnergyMine);
        }
    }

    protected shouldRenewTarget(creep: Creep): boolean {
        const target = this.getCurrentStructureTarget(creep);

        return !(target instanceof ConstructionSite);
    }

    protected getTarget(creep: Creep): ConstructionSite {
        return this.getSites().sort(Sort.byDistance(creep)).shift();
    }

    protected getBody(spawn: StructureSpawn): BodyPartConstant[] {
        return Utils.getBiggerPossibleBody(WORKER_BODIES, BASE_WORKER_CREEP_BODY, spawn);
    }

    private getSites(): ConstructionSite[] {
        let sites = [];
        for (const siteName in Game.constructionSites) {
            const site = Game.constructionSites[siteName];

            if (site.room.find(FIND_MY_SPAWNS).length === 0 || site.room.controller.level < BUILD_REMOTE_ROOMS_UP_TO_LEVEL) {
                sites.push(site);
            }
        }
        return sites;
    }
}
