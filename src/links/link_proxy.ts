import {DEMANDING, SOURCING, STORAGE_TYPE} from "./link_manager_const";

export enum LinkType {
    DEMAND = 'controller',
    SOURCE = 'source',
    STORAGE = 'storage',
    UNKNOWN = 'unknown',
}

export default class LinkProxy {
    public readonly link: StructureLink;
    public readonly type: LinkType;
    private cooldown: boolean;
    private amount: number;
    private storageType: STORAGE_TYPE = null;

    constructor(link: StructureLink) {
        this.link = link;
        this.cooldown = this.link.cooldown > 0;
        this.type = this.detectType();
        this.amount = this.getInitialAmount();
    }

    public onCooldown(): boolean {
        return this.cooldown;
    }

    public getAmount(): number {
        return this.amount;
    }

    public isDemanding(): boolean {
        return this.type === LinkType.DEMAND && this.getAmount() > 200;
    }

    public isSourcing(): boolean {
        if (this.link.cooldown !== 0) {
            return false;
        }

        if (this.getAmount() < 200) {
            return false;
        }

        return this.type === LinkType.SOURCE || this.type === LinkType.STORAGE && this.storageType === SOURCING;
    }

    public withdraw(link: LinkProxy, amount: number): void {
        if (this.cooldown) {
            return;
        }

        if (amount < 400) {
            return;
        }

        if (OK === link.link.transferEnergy(this.link, amount)) {
            this.amount += amount;
            link.amount -= amount;
            link.cooldown = true;
        }
    }

    public transfer(link: LinkProxy, amount: number): void {
        if (this.cooldown) {
            return;
        }

        if (amount < 400) {
            return;
        }

        if (OK === this.link.transferEnergy(link.link, amount)) {
            this.amount -= amount;
            link.amount += amount;
            this.cooldown = true;
        }
    }

    public setStorageType(storageType: STORAGE_TYPE) {
        this.storageType = storageType;
        this.amount = this.getInitialAmount();

        return this;
    }

    private getInitialAmount(): number {
        if (this.type === LinkType.DEMAND || this.type === LinkType.STORAGE && this.storageType === DEMANDING) {
            return this.link.store.getFreeCapacity(RESOURCE_ENERGY);
        }

        if (this.type === LinkType.SOURCE || this.type === LinkType.STORAGE && this.storageType === SOURCING) {
            return this.link.store.getUsedCapacity(RESOURCE_ENERGY);
        }

        return undefined;
    }

    private detectType(): LinkType {
        if (this.link.pos.getRangeTo(this.link.room.storage) < 3) {
            return LinkType.STORAGE;
        }

        if (this.link.pos.getRangeTo(this.link.room.controller) < 5) {
            return LinkType.DEMAND;
        }

        if (this.link.pos.getRangeTo(this.link.room.terminal) < 5) {
            return LinkType.DEMAND;
        }

        const sources: Source[] = this.link.room.find(FIND_SOURCES);
        for (let source of sources) {
            if (this.link.pos.getRangeTo(source) < 3) {
                return LinkType.SOURCE;
            }
        }

        return LinkType.UNKNOWN;
    }
}
