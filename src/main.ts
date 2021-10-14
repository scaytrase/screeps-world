import Cleaner from "./activities/cleaner";
import CreepRetirementProgram from "./activities/creep_retirement_program";
import CreepRunner from "./activities/creep_runner";
import CreepSpawnBound from "./activities/creep_spawn_bound";
import CreepSpawner from "./activities/creep_spawner";
import LinkManager from "./links/link_manager";
import Role from "./role";
import BuilderRole from "./role/builder";
import EnergyAggregatorRole from "./role/energy_aggregator";
import GraveKeeperRole from "./role/grave_keeper";
import GuardRole from "./role/guard";
import HarvesterRole from "./role/harvester";
import MinerRole from "./role/miner";
import RepairerRole from "./role/repairer";
import ResourceAggregatorRole from "./role/resource_aggregator";
import RoomClaimerRole from "./role/room_claimer";
import SpawnKeeperRole from "./role/spawn_keeper";
import StorageLinkKeeperRole from "./role/storage_link_keeper";
import TerminalResourceCarrierRole from "./role/terminal_resource_carrier";
import TowerKeeperRole from "./role/tower_keeper";
import UpgraderRole from "./role/upgrader";
import WallKeeperRole from "./role/wall_keeper";
import Activity from "./activity";
import TowerController from "./activities/tower_controller";
import Utils from "./utils/utils";
import EconomyLogger from "./activities/economy_logger";
import ResourceSeller from "./activities/resource_seller";
import Logger from "./utils/logger";
import RemoteBuilderRole from "./role/remote_builder";
import RemoteUpgraderRole from "./role/remote_upgrader";
import AttackerRole from "./role/attacker";

module.exports.loop = function () {
    const roles: Role[] = [
        new HarvesterRole(),
        new UpgraderRole(),
        new BuilderRole(),
        new RepairerRole(),
        new SpawnKeeperRole(),
        new EnergyAggregatorRole(),
        new GuardRole(),
        new TowerKeeperRole(),
        new GraveKeeperRole(),
        new WallKeeperRole(),
        new MinerRole(),
        new TerminalResourceCarrierRole(),
        new ResourceAggregatorRole(),
        new StorageLinkKeeperRole(),
        new AttackerRole(),
        new RemoteBuilderRole(),
        new RemoteUpgraderRole(),
        // new RoomCleanerRole(),
    ];

    for (let flag of Utils.getFlagsByColors(COLOR_RED, COLOR_PURPLE)) {
        roles.push(new RoomClaimerRole(flag));
    }

    let runnables: Array<Activity> = [];

    runnables.push(new CreepRunner(roles));

    for (const room of Object.values(Game.rooms)) {
        runnables.push(new LinkManager(room));
        runnables.push(new TowerController(room));
        runnables.push(new ResourceSeller(room));
    }

    for (const spawn of Object.values(Game.spawns)) {
        runnables.push(new CreepSpawner(roles, spawn));
    }

    runnables.push(new CreepSpawnBound());
    runnables.push(new CreepRetirementProgram());
    runnables.push(new Cleaner());
    if (Game.cpu.bucket > 9000) {
        runnables.push(new EconomyLogger());
    }

    for (const runnable of runnables) {
        try {
            runnable.run();
        } catch (e) {
            Logger.warn(`Unable to run activity ${runnable.constructor.name}`)
            Logger.warn(e.toString())
        }
    }
};
