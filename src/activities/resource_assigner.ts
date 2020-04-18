import {MAX_WORK_PER_RESOURCE} from "../config/config";
import Utils from "../utils/utils";

export default class ResourceAssigner {
    public static getResource(room: Room): Source | undefined {
        const sources = room.find(FIND_SOURCES);
        const creeps = room.find(FIND_MY_CREEPS).filter(Utils.filterDeadCreeps);

        const resourceMap = ResourceAssigner.createResourceMap(sources, creeps);

        let minResource: Source = resourceMap.keys().next().value;
        for (let resource of resourceMap.keys()) {
            if (resourceMap.get(resource) < resourceMap.get(minResource)) {
                minResource = resource;
            }
        }

        if (resourceMap.get(minResource) >= MAX_WORK_PER_RESOURCE) {
            return undefined;
        }

        return minResource;
    }

    private static createResourceMap(sources: Source[], creeps: Creep[]): Map<Source, number> {
        let resourceMap: Map<Source, number> = new Map<Source, number>();
        for (let source of sources) {
            resourceMap.set(source, 0);
        }

        for (const creep of creeps) {
            const assignedResource: Id<Source> = creep.memory['target'];
            if (assignedResource === undefined) {
                continue;
            }

            let source = Game.getObjectById(assignedResource);

            resourceMap.set(source, resourceMap.get(source) + Utils.countCreepBodyParts(creep, WORK));
        }
        return resourceMap;
    }
}
