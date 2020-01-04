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
            shouldSpawn(spawn: StructureSpawn, game: Game): boolean {
                return Utils.findCreepsByRole(game, role, spawn.room).length < LinkManagerUtils.getStorageLinks(spawn.room, game).length;
            }
        };
    }

    public run(creep: Creep, game: Game): void {
        if (!creep.memory['target']) {
            creep.memory['target'] = this.assignCreepToLink(creep.room, game);
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

    protected getBody(game: Game, spawn: StructureSpawn): BodyPartConstant[] {
        const bodies = CARRIER_BODIES.filter(body => body.filter(part => part === CARRY).length <= 5);

        return Utils.getBiggerPossibleBodyNow(bodies, BASE_CARRIER_CREEP_BODY, spawn);
    }

    protected getRoleName(): string {
        return "storage_link_keeper";
    }

    private assignCreepToLink(room: Room, game: Game): Id<StructureLink> {
        const creeps = Utils.findCreepsByRole(game, this, room);
        const links = LinkManagerUtils.getStorageLinks(room, game);

        for (let link of links) {
            if (creeps.filter(creep => creep.memory['target'] === link.link.id).length === 0) {
                return link.link.id;
            }
        }

        return undefined;
    }
}
