import {BASE_CARRIER_CREEP_BODY, CARRIER_BODIES} from "./const";
import {COLOR_SPECIAL_TASKS} from "./creep_traits";
import LinkManagerUtils from "./link_manager_utils";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import Utils from "./utils";

export default class StorageLinkKeeperRole extends BaseCreepRole {
    public getSpawnStrategy(): SpawnStrategy {
        const role = this;

        return {
            shouldSpawn(spawn: StructureSpawn): boolean {
                return Utils.findCreepsByRole(role, spawn.room).length < LinkManagerUtils.getStorageLinks(spawn.room).length;
            }
        };
    }

    public run(creep: Creep): void {
        if (!creep.memory['target']) {
            creep.memory['target'] = this.assignCreepToLink(creep.room);
        }

        const target = Game.getObjectById<StructureLink>(creep.memory['target']);
        if (!target) {
            creep.suicide();
        }

        if (creep.pos.getRangeTo(target) > 1) {
            creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_SPECIAL_TASKS}});
        }

        // Await LinkManager orders
        // @see LinkManager.run()
    }

    public getRoleName(): string {
        return "storage_link_keeper";
    }

    protected getBody(spawn: StructureSpawn): BodyPartConstant[] {
        const bodies = CARRIER_BODIES.filter(body => body.filter(part => part === CARRY).length <= 8);

        return Utils.getBiggerPossibleBodyNow(bodies, BASE_CARRIER_CREEP_BODY, spawn);
    }

    private assignCreepToLink(room: Room): Id<StructureLink> {
        const creeps = Utils.findCreepsByRole(this, room);
        const links = LinkManagerUtils.getStorageLinks(room);

        for (let link of links) {
            if (creeps.filter(creep => creep.memory['target'] === link.link.id).length === 0) {
                return link.link.id;
            }
        }

        return undefined;
    }
}
