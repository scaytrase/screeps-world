import CreepTrait from "../creep_traits";
import LinkProxy, {LinkType} from "./link_proxy";
import Logger from "../utils/logger";
import StorageLinkKeeperRole from "../role/storage_link_keeper";
import Activity from "../activity";
import Utils from "../utils/utils";
import {DEMANDING, SOURCING, STORAGE_TYPE} from "./link_manager_const";

export default class LinkManager implements Activity {
    private readonly room: Room;
    private storage_state: STORAGE_TYPE;

    constructor(room: Room) {
        this.room = room;
    }

    public static getLinks(room: Room): LinkProxy[] {
        return room.find<StructureLink>(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_LINK}}).map(link => new LinkProxy(link));
    }

    public static getDemandLinks(links: LinkProxy[]): LinkProxy[] {
        return links.filter(link => link.isDemanding() && link.type === LinkType.DEMAND);
    }

    public static getSourceLinks(links: LinkProxy[]): LinkProxy[] {
        return links.filter(link => link.isSourcing() && link.type === LinkType.SOURCE);
    }

    public static getStorageLinks(links: LinkProxy[], storageType: STORAGE_TYPE): LinkProxy[] {
        return links.filter(link => link.type === LinkType.STORAGE).map(link => link.setStorageType(storageType));
    }

    private static getKeeper(link: LinkProxy): Creep | undefined {
        const keepers = Utils.findCreepsByRole(new StorageLinkKeeperRole(), link.link.room);

        for (let keeper of keepers) {
            if (keeper.memory['target'] === link.link.id) {
                return keeper;
            }
        }

        return undefined;
    }

    private static resetKeeper(link: LinkProxy) {
        const keeper = LinkManager.getKeeper(link);
        if (!keeper) {
            return;
        }

        CreepTrait.transferAllEnergy(keeper, keeper.room.storage);
    }

    private static fillStorageLink(link: LinkProxy) {
        const keeper = LinkManager.getKeeper(link);
        if (!keeper) {
            return;
        }

        if (keeper.store.getFreeCapacity() > 0) {
            CreepTrait.withdrawAllEnergy(keeper, keeper.room.storage);
        } else {
            CreepTrait.transferAllEnergy(keeper, link.link);
        }
    }

    private static emptyStorageLink(link: LinkProxy) {
        const keeper = LinkManager.getKeeper(link);
        if (!keeper) {
            return;
        }

        if (keeper.store.getFreeCapacity() > 0) {
            CreepTrait.withdrawAllEnergy(keeper, link.link);
        } else {
            CreepTrait.transferAllEnergy(keeper, keeper.room.storage);
        }
    }

    private static fulfilDemand(demandLinks: LinkProxy[], sourceLinks: LinkProxy[]) {
        for (const demandLink of demandLinks) {
            for (const sourceLink of sourceLinks) {
                if (!sourceLink.isSourcing()) {
                    Logger.debug(`link ${sourceLink.link.id} is cooling down for ${sourceLink.link.cooldown}`);

                    continue;
                }

                const amount = Math.min(sourceLink.getAmount(), demandLink.getAmount());

                Logger.debug(`providing ${amount} to ${demandLink.link.id} from ${sourceLink.link.id}`);
                demandLink.withdraw(sourceLink, amount);
                if (!demandLink.isDemanding()) {
                    break;
                }
            }
        }
    }

    public run(): void {
        const links = LinkManager.getLinks(this.room);

        LinkManager.fulfilDemand(LinkManager.getDemandLinks(links), LinkManager.getSourceLinks(links));

        this.detectStorageState(links);
        this.processStorageState(links);
    }

    private processStorageState(links: LinkProxy[]) {
        const storageLinks = LinkManager.getStorageLinks(links, this.storage_state);
        switch (this.storage_state) {
            case SOURCING:
                for (const storageLink of storageLinks) {
                    LinkManager.fillStorageLink(storageLink);
                }

                LinkManager.fulfilDemand(LinkManager.getDemandLinks(links), storageLinks);
                break;
            case DEMANDING:
                for (const storageLink of storageLinks) {
                    LinkManager.emptyStorageLink(storageLink);
                }

                LinkManager.fulfilDemand(storageLinks, LinkManager.getSourceLinks(links));
                break;
            case null:
                for (const storageLink of storageLinks) {
                    LinkManager.resetKeeper(storageLink)
                }
                break;
        }
    }

    private detectStorageState(links: LinkProxy[]) {
        const sourceLinks = LinkManager.getSourceLinks(links);
        const demandLinks = LinkManager.getDemandLinks(links);

        if (sourceLinks.length > 0 && demandLinks.length > 0) {
            Logger.debug(`invalid link proxy logic. both sourcing and demanding links exist after processing in ${this.room.name}`);
        }

        this.storage_state = null;

        if (sourceLinks.length > 0) {
            this.storage_state = DEMANDING;
        }

        if (demandLinks.length > 0) {
            this.storage_state = SOURCING;
        }
    }
}
