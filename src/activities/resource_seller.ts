import Activity from "../activity";
import OrderUtil from "../marketing/order_util";
import Logger from "../utils/logger";
import {DEFENSIVE_PRICE_LIMIT, DEFENSIVE_TICKS_TIMEOUT, EXCESS_ORDER_SIZE} from "../config/config";

export default class ResourceSeller implements Activity {
    private static lastTick: number = undefined;
    private readonly room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    run(): void {
        OrderUtil.getExcessResources(this.room).map(resource => {
            if (!OrderUtil.hasOrder(this.room, resource)) {
                if (ResourceSeller.lastTick !== undefined && (Game.time - ResourceSeller.lastTick) < DEFENSIVE_TICKS_TIMEOUT) {
                    return
                }

                const price = OrderUtil.getResourcePrice(resource);
                if (price === undefined || price < DEFENSIVE_PRICE_LIMIT) {
                    // defensive condition
                    return;
                }

                Logger.warn(`Room ${this.room.name} has no active orders for excess ${resource}`);
                Logger.warn(`Room ${this.room.name} creating order for ${resource} with price ${price}`);

                Game.market.createOrder({
                    type: ORDER_SELL,
                    resourceType: resource,
                    price,
                    totalAmount: EXCESS_ORDER_SIZE,
                    roomName: this.room.name
                });

                Game.notify(`Room ${this.room.name} creating order for ${resource} with price ${price}`);

                ResourceSeller.lastTick = Game.time;
            }
        });
    }
}