import {
    BUILD_REMOTE_ROOMS_UP_TO_LEVEL,
    MIN_ECONOMY_FOR_REMOTE_CREEP_PRODUCERS,
    REMOTE_BUILDERS_COUNT_LIMIT
} from "./config";
import {BASE_WORKER_CREEP_BODY, WORKER_BODIES} from "./const";
import CreepTrait from "./creep_traits";
import WorkRestCycleCreepRole from "./role.work_rest_cycle_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import NotEmptyCallableResult from "./spawn_strategy.not_empty_callable_result";
import Utils from "./utils";

export default class RemoteBuilderRole extends WorkRestCycleCreepRole<ConstructionSite> {
    public getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy([
            new LimitedSpawnByRoleCountStrategy(REMOTE_BUILDERS_COUNT_LIMIT, this, () => 1, true),
            new NotEmptyCallableResult((game, spawn) => this.getSites(game).shift()),
            new NotEmptyCallableResult((game, spawn) => spawn.room.storage && spawn.room.storage.store.getUsedCapacity() > MIN_ECONOMY_FOR_REMOTE_CREEP_PRODUCERS),
        ]);
    }

    protected isSpawnBound(): boolean {
        return false;
    }

    protected shouldWork(creep: Creep, game: Game): boolean {
        return creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0;
    }

    protected shouldRest(creep: Creep, game: Game): boolean {
        return creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
    }

    protected work(creep: Creep, game: Game): void {
        CreepTrait.build(creep, this.getCurrentStructureTarget(creep));
    }

    protected rest(creep: Creep, game: Game): void {
        const source = Utils.getClosestEnergySource(creep, [STRUCTURE_STORAGE, STRUCTURE_CONTAINER]);
        const closestEnergyMine = Utils.getClosestEnergyMine(creep);

        if (creep.pos.getRangeTo(source) < creep.pos.getRangeTo(closestEnergyMine)) {
            CreepTrait.withdrawAllEnergy(creep, source);
        } else {
            CreepTrait.harvest(creep, closestEnergyMine);
        }
    }

    protected shouldRenewTarget(creep: Creep, game: Game): boolean {
        const target = this.getCurrentStructureTarget(creep);

        return !(target instanceof ConstructionSite);
    }

    protected getTarget(creep: Creep, game: Game): ConstructionSite {
        return this.getSites(game).sort(Utils.sortByDistance(creep)).shift();
    }

    protected getBody(game: Game, spawn: StructureSpawn): BodyPartConstant[] {
        return Utils.getBiggerPossibleBody(WORKER_BODIES, BASE_WORKER_CREEP_BODY, spawn);
    }

    protected getRoleName(): string {
        return 'remote_builder';
    }

    private getSites(game: Game): ConstructionSite[] {
        let sites = [];
        for (const siteName in game.constructionSites) {
            const site = game.constructionSites[siteName];

            if (site.room.find(FIND_MY_SPAWNS).length === 0 || site.room.controller.level < BUILD_REMOTE_ROOMS_UP_TO_LEVEL) {
                sites.push(site);
            }
        }
        return sites;
    }
}
