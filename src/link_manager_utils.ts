import LinkProxy, {LinkType} from "./link_proxy";

export default class LinkManagerUtils {
    public static getStorageLinks(room: Room, game: Game): LinkProxy[] {
        return room
            .find<StructureLink>(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_LINK}})
            .map(link => new LinkProxy(link, game))
            .filter(proxy => proxy.type === LinkType.STORAGE);
    }
}
