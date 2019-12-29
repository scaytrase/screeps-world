import CreepTrait from "./creep_traits";
import LinkProxy, {LinkType} from "./link_proxy";
import StorageLinkKeeperRole from "./role.storage_link_keeper";
import Runnable from "./runnable";
import Utils from "./utils";

export default class LinkManager implements Runnable {
    private readonly room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    private static getKeeper(link: LinkProxy, game: Game): Creep | undefined {
        const keepers = Utils.findCreepsByRole(game, new StorageLinkKeeperRole(), link.link.room);

        for (let keeper of keepers) {
            if (keeper.memory['target'] === link.link.id) {
                return keeper;
            }
        }

        return undefined;
    }

    public run(game: Game, memory: Memory): void {
        const links = this.room.find<StructureLink>(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_LINK}}).map(link => new LinkProxy(link, game));

        for (let demandLink of this.getDemandLinks(links)) {
            for (let sourceLink of this.getSourceLinks(links)) {
                const amount = Math.min(sourceLink.getAmount(), demandLink.getAmount());

                console.log(`[DEBUG] providing ${amount} to ${demandLink.link.id} from ${sourceLink.link.id}`);
                if (sourceLink.link.cooldown > 0) {
                    console.log(`[DEBUG] link ${sourceLink.link.id} is cooling down for ${sourceLink.link.cooldown}`);
                } else {
                    demandLink.withdraw(sourceLink, amount);
                    if (!demandLink.isDemanding()) {
                        break;
                    }
                }
            }

            if (!demandLink.isDemanding()) {
                continue;
            }


            for (let storageLink of this.getStorageLinks(links)) {
                const amount = Math.min(storageLink.getAmount(), demandLink.getAmount());

                console.log(`[DEBUG] demanding ${demandLink.getAmount()} to ${demandLink.link.id} from storage ${storageLink.link.id}`);
                if (storageLink.link.cooldown > 0) {
                    console.log(`[DEBUG] storage ${storageLink.link.id} is cooling down for ${storageLink.link.cooldown}`);
                } else {
                    this.fillStorageLink(storageLink, game);
                    demandLink.withdraw(storageLink, amount);

                    if (!demandLink.isDemanding()) {
                        break;
                    }
                }
            }
        }


        for (let sourceLink of this.getSourceLinks(links)) {
            for (let storageLink of this.getStorageLinks(links)) {
                const amount = sourceLink.getAmount();

                if (sourceLink.link.cooldown > 0) {
                    console.log(`[DEBUG] providing ${amount} to storage from ${sourceLink.link.id} after cooldown ${sourceLink.link.cooldown}`);
                } else {
                    console.log(`[DEBUG] providing ${amount} to storage from ${sourceLink.link.id}`);
                    this.emptyStorageLink(storageLink, game);
                    storageLink.withdraw(sourceLink, amount);
                }
            }
        }

        for (let storageLink of this.getStorageLinks(links)) {
            this.resetKeeper(storageLink, game);
        }
    }

    private resetKeeper(link: LinkProxy, game: Game) {
        const keeper = LinkManager.getKeeper(link, game);
        if (!keeper) {
            return;
        }

        CreepTrait.transferAllEnergy(keeper, keeper.room.storage);
    }

    private fillStorageLink(link: LinkProxy, game: Game) {
        const keeper = LinkManager.getKeeper(link, game);
        if (!keeper) {
            return;
        }

        if (keeper.store.getFreeCapacity() > 0) {
            CreepTrait.withdrawAllEnergy(keeper, keeper.room.storage);
        } else {
            CreepTrait.transferAllEnergy(keeper, link.link);
        }
    }

    private emptyStorageLink(link: LinkProxy, game: Game) {
        const keeper = LinkManager.getKeeper(link, game);
        if (!keeper) {
            return;
        }

        if (keeper.store.getFreeCapacity() > 0) {
            CreepTrait.withdrawAllEnergy(keeper, link.link);
        } else {
            CreepTrait.transferAllEnergy(keeper, keeper.room.storage);
        }
    }

    private getDemandLinks(links: LinkProxy[]): LinkProxy[] {
        return links.filter(link => link.isDemanding());
    }

    private getSourceLinks(links: LinkProxy[]): LinkProxy[] {
        return links.filter(link => link.isSourcing());
    }

    private getStorageLinks(links: LinkProxy[]): LinkProxy[] {
        return links.filter(link => link.type === LinkType.STORAGE);
    }
}
