import Runnable from "./runnable";
import CreepRunner from "./creep_runner";
import Cleaner from "./cleaner";
import HarvesterRole from "./role.harvester";
import UpgraderRole from "./role.upgrader";
import BuilderRole from "./role.builder";
import CreepSpawner from "./creep_spawner";
import ResourceAssigner from "./resource_assigner";
import RepairerRole from "./role.repairer";
import CreepRenewer from "./creep_renewer";
import PermanentSafeModeActivator from "./permanent_safe_mode_activator";
import SpawnKeeperRole from "./role.spawn_keeper";
import EnergyAggregatorRole from "./role.energy_aggregator";
import GuardRole from "./role.guard";
import TowerController from "./tower_controller";
import GraveKeeperRole from "./role.grave_keeper";
import WallKeeperRole from "./role.wall_keeper";
import LinkController from "./link_controller";
import LinkKeeperRole from "./role.link_keeper";

const roles = [
    new HarvesterRole(),
    new GuardRole(),
    new SpawnKeeperRole(),
    new RepairerRole(),
    new EnergyAggregatorRole(),
    new GraveKeeperRole(),
    new UpgraderRole(),
    new BuilderRole(),
    new WallKeeperRole(),
    new LinkKeeperRole(),
];

module.exports.loop = function () {
    const spawn = Game.spawns['Spawn1'];

    let runnables: Array<Runnable> = [];

    runnables.push(new Cleaner());
    runnables.push(new ResourceAssigner(spawn));
    runnables.push(new CreepSpawner(roles, spawn));
    runnables.push(new CreepRunner(roles));
    runnables.push(new CreepRenewer(spawn));
    runnables.push(new PermanentSafeModeActivator(spawn));
    runnables.push(new TowerController(spawn.room));
    runnables.push(new LinkController(spawn));

    for (let runnable of runnables) {
        runnable.run(Game, Memory);
    }
};
