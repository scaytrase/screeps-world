import LinkProxy, {LinkType} from "./link_proxy";

export default class LinkManagerUtils {
    public static getStorageLinks(room: Room): LinkProxy[] {
        return room
            .find<StructureLink>(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_LINK}})
            .map(link => new LinkProxy(link))
            .filter(proxy => proxy.type === LinkType.STORAGE);
    }
}
