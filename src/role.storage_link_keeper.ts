import {LINK_KEEPER_BODY} from "./config";
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
                return Utils.findCreepsByRole(game, role).length < LinkManagerUtils.getStorageLinks(spawn.room, game).length;
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
        return LINK_KEEPER_BODY;
    }

    protected getRoleName(): string {
        return "storage_link_keeper";
    }

    private assignCreepToLink(room: Room, game: Game): Id<StructureLink> {
        const creeps = Utils.findCreepsByRole(game, this);
        const links = LinkManagerUtils.getStorageLinks(room, game);

        for (let link of links) {
            if (creeps.filter(creep => creep.memory['target'] === link.link.id).length === 0) {
                return link.link.id;
            }
        }

        return undefined;
    }
}
