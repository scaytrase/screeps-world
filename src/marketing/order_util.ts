import {PRICE_FORMULA, STORAGE_EXCESS_LIMIT, TERMINAL_EXCESS_LIMIT} from "../config/config";

export default class OrderUtil {
    public static hasPlacedOrder(room: Room, resource: ResourceConstant): boolean {
        return Object.values(Game.market.orders)
            .filter(order => order.resourceType === resource && order.roomName === room.name && order.remainingAmount > 0)
            .length > 0;
    }

    public static getExcessResources(room: Room): ResourceConstant[] {
        //  you cannot have excess resources if you can't store them
        if (!room.storage && !room.terminal) {
            return [];
        }

        let resources: ResourceConstant[] = [];
        if (room.storage) {
            Object.keys(room.storage.store)
                .filter((resource: ResourceConstant) => room.storage.store.getUsedCapacity(resource) > STORAGE_EXCESS_LIMIT)
                .map((resource: ResourceConstant) => resources.push(resource));
        }

        if (room.terminal) {
            Object.keys(room.terminal.store)
                .filter((resource: ResourceConstant) => room.terminal.store.getUsedCapacity(resource) > TERMINAL_EXCESS_LIMIT)
                .filter((resource: ResourceConstant) => resource !== RESOURCE_ENERGY)
                .map((resource: ResourceConstant) => resources.push(resource));
        }

        resources = Array.from(new Set(resources));

        return resources;
    }

    public static getResourcePrice(resource: ResourceConstant): number | undefined {
        let date = new Date();
        date.setDate(date.getDate() - 1);

        const dateString = date.toISOString().slice(0, 10);

        let logs = Game.market.getHistory(resource).filter(entry => entry.date === dateString);

        if (logs.length !== 1) {
            return undefined;
        }

        const price = PRICE_FORMULA(logs[0]);

        return Number(price.toFixed(3));
    }
}