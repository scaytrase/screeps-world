import Cleaner from "./cleaner";
import CreepRetirementProgram from "./creep_retirement_program";
import CreepRunner from "./creep_runner";
import CreepSpawnBound from "./creep_spawn_bound";
import CreepSpawner from "./creep_spawner";
import EconomyLogger from "./economy_logger";
import LinkManager from "./link_manager";
import ResourceAssigner from "./resource_assigner";
import Role from "./role";
import BuilderRole from "./role.builder";
import EnergyAggregatorRole from "./role.energy_aggregator";
import GraveKeeperRole from "./role.grave_keeper";
import GuardRole from "./role.guard";
import HarvesterRole from "./role.harvester";
import MinerRole from "./role.miner";
import RangeGuardRole from "./role.range_guard";
import RemoteBuilderRole from "./role.remote_builder";
import RemoteUpgraderRole from "./role.remote_upgrader";
import RepairerRole from "./role.repairer";
import ResourceAggregatorRole from "./role.resource_aggregator";
import RoomClaimerRole from "./role.room_claimer";
import SpawnKeeperRole from "./role.spawn_keeper";
import StorageLinkKeeperRole from "./role.storage_link_keeper";
import TerminalKeeperRole from "./role.terminal_keeper";
import TerminalResourceCarrierRole from "./role.terminal_resource_carrier";
import TowerKeeperRole from "./role.tower_keeper";
import UpgraderRole from "./role.upgrader";
import WallKeeperRole from "./role.wall_keeper";
import Runnable from "./runnable";
import TowerController from "./tower_controller";
import Utils from "./utils";

const roles: Role[] = [
    new HarvesterRole(),
    new SpawnKeeperRole(),
    new EnergyAggregatorRole(),
    new UpgraderRole(),
    new GuardRole(),
    new RangeGuardRole(),
    new TowerKeeperRole(),
    new RepairerRole(),
    new GraveKeeperRole(),
    new BuilderRole(),
    new WallKeeperRole(),
    new MinerRole(),
    new TerminalResourceCarrierRole(),
    new TerminalKeeperRole(),
    new ResourceAggregatorRole(),
    new StorageLinkKeeperRole(),
    new RemoteBuilderRole(),
    new RemoteUpgraderRole(),
];

for (let flag of Utils.getFlagsByColors(Game, COLOR_RED, COLOR_PURPLE)) {
    roles.push(new RoomClaimerRole(flag));
}

let spawns: StructureSpawn[] = [];
for (const spawnName in Game.spawns) {
    spawns.push(Game.spawns[spawnName]);
}

module.exports.loop = function () {
    for (const spawn of spawns) {
        let runnables: Array<Runnable> = [];

        runnables.push(new EconomyLogger());
        runnables.push(new Cleaner());
        runnables.push(new ResourceAssigner(spawn.room));
        runnables.push(new CreepSpawner(roles, spawn));
        runnables.push(new CreepRunner(roles));
        runnables.push(new TowerController(spawn.room));
        runnables.push(new CreepSpawnBound(spawn));
        runnables.push(new CreepRetirementProgram());
        runnables.push(new LinkManager(spawn.room));

        for (let runnable of runnables) {
            runnable.run(Game, Memory);
        }
    }
};
