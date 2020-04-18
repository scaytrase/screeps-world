import Economy from "../economy";
import EconomyUtils from "../utils/economy_utils";
import HarvesterRole from "../role/harvester";
import UpgraderRole from "../role/upgrader";
import Activity from "../activity";
import Utils from "../utils/utils";

export default class EconomyLogger implements Activity {
    private static getSpawnMessage(spawn: StructureSpawn): string {
        const available = spawn.room.energyAvailable;
        const max = spawn.room.energyCapacityAvailable;

        return `❤️ Spawn energy level: ${available} of ${max} (${Math.round(100 * available / max)}%)`;
    }

    private static getEconomyMessage(spawn: StructureSpawn): string {
        return `💰 Economy level: ${Economy.getCurrentEconomyLevel(spawn.room)}`;
    }

    private static getTotalMessage(room: Room): string {

        const available: number = EconomyUtils.usableSpawnEnergyAvailable(room);
        const max: number = EconomyUtils.usableSpawnEnergyMax(room);

        return `🔋 Total energy resources: ${available} of ${max} (${Math.round(100 * available / max)}%) `;
    }

    private static getStorageMessage(room: Room): string {
        if (!room.storage) {
            return `🚫 No store`;
        }

        const store = room.storage.store;

        return `💳 Storage energy level: ${store.getUsedCapacity(RESOURCE_ENERGY)} of ${store.getCapacity(RESOURCE_ENERGY)} (${Math.round(100 * store.getUsedCapacity(RESOURCE_ENERGY) / store.getCapacity(RESOURCE_ENERGY))}%)`;
    }

    public run(): void {
        Object.values(Game.spawns).map(
            (spawn: StructureSpawn) => {
                const style: TextStyle = {color: '#e7ffda', align: 'left'};
                spawn.room.visual.text(EconomyLogger.getEconomyMessage(spawn), 2, 44, style);
                spawn.room.visual.text(EconomyLogger.getSpawnMessage(spawn), 2, 45, style);
                spawn.room.visual.text(JSON.stringify(spawn.spawning), 2, 46, style);
                spawn.room.visual.text(EconomyLogger.getStorageMessage(spawn.room), 2, 47, style);
                spawn.room.visual.text(EconomyLogger.getTotalMessage(spawn.room), 2, 48, style);

                for (const resource of spawn.room.find(FIND_SOURCES)) {
                    const harvesters = HarvesterRole
                        .getCurrentHarvesters(resource)
                        .map(creep => Utils.countCreepBodyParts(creep, WORK))
                        .reduce((p, v) => p + v, 0);

                    spawn.room.visual.text(`${harvesters}`, resource.pos.x, resource.pos.y + 1, {
                        opacity: 0.9,
                        color: '#ffffff'
                    });
                }

                const upgraders = (new UpgraderRole()).getCurrentWork(spawn);

                spawn.room.visual.text(`${upgraders}`, spawn.room.controller.pos.x, spawn.room.controller.pos.y + 2, {
                    opacity: 0.9,
                    color: '#ffffff'
                });
            }
        );
    }
}
