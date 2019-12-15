import Cleaner from "./cleaner";
import CreepRetirementProgram from "./creep_retirement_program";
import CreepRunner from "./creep_runner";
import CreepSpawnBound from "./creep_spawn_bound";
import CreepSpawner from "./creep_spawner";
import EconomyLogger from "./economy_logger";
import LinkManager from "./link_manager";
import ResourceAssigner from "./resource_assigner";
import BuilderRole from "./role.builder";
import EnergyAggregatorRole from "./role.energy_aggregator";
import GraveKeeperRole from "./role.grave_keeper";
import GuardRole from "./role.guard";
import HarvesterRole from "./role.harvester";
import MinerRole from "./role.miner";
import RangeGuardRole from "./role.range_guard";
import RepairerRole from "./role.repairer";
import ResourceAggregatorRole from "./role.resource_aggregator";
import SpawnKeeperRole from "./role.spawn_keeper";
import StorageLinkKeeperRole from "./role.storage_link_keeper";
import TerminalKeeperRole from "./role.terminal_keeper";
import TerminalResourceCarrierRole from "./role.terminal_resource_carrier";
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
    new MinerRole(),
    new TerminalResourceCarrierRole(),
    new TerminalKeeperRole(),
    new ResourceAggregatorRole(),
    new StorageLinkKeeperRole(),
];

const spawns: StructureSpawn[] = [
    Game.spawns['Spawn1']
];

module.exports.loop = function () {
    for (const spawn of spawns) {
        let runnables: Array<Runnable> = [];

        runnables.push(new Cleaner());
        runnables.push(new ResourceAssigner(spawn.room));
        runnables.push(new CreepSpawner(roles, spawn));
        runnables.push(new CreepRunner(roles));
        runnables.push(new TowerController(spawn.room));
        runnables.push(new CreepSpawnBound(spawn));
        runnables.push(new CreepRetirementProgram());
        runnables.push(new EconomyLogger());
        runnables.push(new LinkManager(spawn.room));

        for (let runnable of runnables) {
            runnable.run(Game, Memory);
        }
    }
};
