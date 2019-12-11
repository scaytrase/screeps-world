import Cleaner from "./cleaner";
import CreepRetirementProgram from "./creep_retirement_program";
import CreepRunner from "./creep_runner";
import CreepSpawnBound from "./creep_spawn_bound";
import CreepSpawner from "./creep_spawner";
import EconomyLogger from "./economy_logger";
import ProviderLinkController from "./provider_link_controller";
import ReceiverLinkController from "./receiver_link_controller";
import ResourceAssigner from "./resource_assigner";
import BuilderRole from "./role.builder";
import EnergyAggregatorRole from "./role.energy_aggregator";
import GraveKeeperRole from "./role.grave_keeper";
import GuardRole from "./role.guard";
import HarvesterRole from "./role.harvester";
import MinerRole from "./role.miner";
import ProviderLinkKeeperRole from "./role.provider_link_keeper";
import RangeGuardRole from "./role.range_guard";
import ReceiverLinkKeeperRole from "./role.receiver_link_keeper";
import RepairerRole from "./role.repairer";
import ResourceAggregator from "./role.resource_aggregator";
import SpawnKeeperRole from "./role.spawn_keeper";
import TerminalKeeperRole from "./role.terminal_keeper";
import TerminalResourceCarrier from "./role.terminal_resource_carrier";
import TowerKeeperRole from "./role.tower_keeper";
import UpgraderRole from "./role.upgrader";
import WallKeeperRole from "./role.wall_keeper";
import Runnable from "./runnable";
import TowerController from "./tower_controller";

const roles = [
    new HarvesterRole(),
    new SpawnKeeperRole(),
    new GuardRole(),
    new RangeGuardRole(),
    new TowerKeeperRole(),
    new RepairerRole(),
    new UpgraderRole(),
    new EnergyAggregatorRole(),
    new GraveKeeperRole(),
    new BuilderRole(),
    new WallKeeperRole(),
    new ReceiverLinkKeeperRole(),
    new ProviderLinkKeeperRole(),
    new MinerRole(),
    new TerminalResourceCarrier(),
    new TerminalKeeperRole(),
    new ResourceAggregator(),
];

module.exports.loop = function () {
    const spawn = Game.spawns['Spawn1'];

    let runnables: Array<Runnable> = [];

    runnables.push(new Cleaner());
    runnables.push(new ResourceAssigner(spawn));
    runnables.push(new CreepSpawner(roles, spawn));
    runnables.push(new CreepRunner(roles));
    runnables.push(new TowerController(spawn.room));
    runnables.push(new ReceiverLinkController(spawn));
    runnables.push(new ProviderLinkController(spawn));
    runnables.push(new CreepSpawnBound(spawn));
    runnables.push(new CreepRetirementProgram());
    runnables.push(new EconomyLogger());

    for (let runnable of runnables) {
        runnable.run(Game, Memory);
    }
};
