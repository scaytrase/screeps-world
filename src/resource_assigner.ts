import {MAX_WORK_PER_RESOURCE, SUICIDE_TTL} from "./config";

export default class ResourceAssigner {
    public static getResource(room: Room): Source | undefined {
        const sources = room.find(FIND_SOURCES);
        const creeps = room.find(FIND_MY_CREEPS);

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

    public static createResourceMap(sources: Source[], creeps: Creep[]): Map<Source, number> {
        let resourceMap: Map<Source, number> = new Map<Source, number>();
        for (let source of sources) {
            resourceMap.set(source, 0);
        }

        for (const creep of creeps) {
            if (creep.ticksToLive < SUICIDE_TTL) {
                continue;
            }

            const assignedResource: Id<Source> = creep.memory['target'];
            if (assignedResource === undefined) {
                continue;
            }

            let source = Game.getObjectById(assignedResource);

            resourceMap.set(source, resourceMap.get(source) + ResourceAssigner.countCreepBodyParts(creep, WORK));
        }
        return resourceMap;
    }

    public static getCurrentHarvesters(resource: Source): Creep[] {
        return resource.room
            .find(FIND_MY_CREEPS)
            .filter(creep => creep.ticksToLive >= SUICIDE_TTL)
            .filter(creep => creep.memory['target'] === resource.id);
    }

    private static countCreepBodyParts(creep: Creep, type: BodyPartConstant): number {
        return creep.body.filter(part => part.type === type).length;
    }
}
