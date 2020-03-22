import Cleaner from "./cleaner";
import CreepRetirementProgram from "./creep_retirement_program";
import CreepRunner from "./creep_runner";
import CreepSpawnBound from "./creep_spawn_bound";
import CreepSpawner from "./creep_spawner";
import LinkManager from "./link_manager";
import Role from "./role";
import BuilderRole from "./role.builder";
import EnergyAggregatorRole from "./role.energy_aggregator";
import GraveKeeperRole from "./role.grave_keeper";
import GuardRole from "./role.guard";
import HarvesterRole from "./role.harvester";
import MinerRole from "./role.miner";
import RepairerRole from "./role.repairer";
import ResourceAggregatorRole from "./role.resource_aggregator";
import RoomClaimerRole from "./role.room_claimer";
import SpawnKeeperRole from "./role.spawn_keeper";
import StorageLinkKeeperRole from "./role.storage_link_keeper";
import TerminalResourceCarrierRole from "./role.terminal_resource_carrier";
import TowerKeeperRole from "./role.tower_keeper";
import UpgraderRole from "./role.upgrader";
import WallKeeperRole from "./role.wall_keeper";
import Runnable from "./runnable";
import TowerController from "./tower_controller";
import Utils from "./utils";

module.exports.loop = function () {
    const roles: Role[] = [
        // new AttackerRole(),
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
        // new RemoteBuilderRole(),
        // new RemoteUpgraderRole(),
        // new RoomCleanerRole(),
    ];

    for (let flag of Utils.getFlagsByColors(COLOR_RED, COLOR_PURPLE)) {
        roles.push(new RoomClaimerRole(flag));
    }

    let runnables: Array<Runnable> = [];

    runnables.push(new CreepRunner(roles));

    for (const room of Object.values(Game.rooms)) {
        runnables.push(new LinkManager(room));
        runnables.push(new TowerController(room));
    }

    for (const spawn of Object.values(Game.spawns)) {
        runnables.push(new CreepSpawner(roles, spawn));
    }

    runnables.push(new CreepSpawnBound());
    runnables.push(new CreepRetirementProgram());
    runnables.push(new Cleaner());
    //runnables.push(new EconomyLogger());

    for (const runnable of runnables) {
        runnable.run();
    }
};
