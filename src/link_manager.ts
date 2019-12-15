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
        const keepers = Utils.findCreepsByRole(game, new StorageLinkKeeperRole());

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
                demandLink.withdraw(sourceLink, Math.min(sourceLink.getAmount(), demandLink.getAmount()));

                if (demandLink.getAmount() === 0) {
                    break;
                }
            }

            if (demandLink.getAmount() === 0) {
                continue;
            }

            for (let storageLink of this.getStorageLinks(links)) {
                this.fillStorageLink(storageLink, game);

                demandLink.withdraw(storageLink, Math.min(storageLink.getAmount(), demandLink.getAmount()));

                if (demandLink.getAmount() === 0) {
                    break;
                }
            }
        }


        for (let sourceLink of this.getSourceLinks(links)) {
            for (let storageLink of this.getStorageLinks(links)) {
                this.emptyStorageLink(storageLink, game);

                storageLink.withdraw(storageLink, Math.min(storageLink.getAmount(), sourceLink.getAmount()));
            }
        }
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

    private getDemandLinks(links: LinkProxy[]) {
        return links.filter(link => link.type === LinkType.DEMAND && link.getAmount() !== 0);
    }

    private getSourceLinks(links: LinkProxy[]) {
        return links.filter(link => link.type === LinkType.SOURCE && link.getAmount() !== 0);
    }

    private getStorageLinks(links: LinkProxy[]) {
        return links.filter(link => link.type === LinkType.STORAGE);
    }
}
