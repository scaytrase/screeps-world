export enum LinkType {
    DEMAND = 'controller',
    SOURCE = 'source',
    STORAGE = 'storage',
    UNKNOWN = 'unknown',
}

export default class LinkProxy {
    public readonly link: StructureLink;
    public readonly type: LinkType;
    private amount: number;

    constructor(link: StructureLink) {
        this.link = link;
        this.type = this.detectType();
        this.amount = this.getInitialAmount();
    }

    public getAmount(): number {
        return this.amount;
    }

    public isDemanding(): boolean {
        return this.type === LinkType.DEMAND && this.getAmount() > 200;
    }

    public isSourcing(): boolean {
        return this.type === LinkType.SOURCE && this.getAmount() > 200;
    }

    public withdraw(link: LinkProxy, amount: number): void {
        if (amount < 400) {
            return;
        }

        if (OK === link.link.transferEnergy(this.link, amount)) {
            this.amount += amount;
            link.amount -= amount;
        }
    }

    public transfer(link: LinkProxy, amount: number): void {
        if (amount < 400) {
            return;
        }

        if (OK === this.link.transferEnergy(link.link, amount)) {
            this.amount -= amount;
            link.amount += amount;
        }
    }

    private getInitialAmount(): number {
        if (this.type === LinkType.DEMAND) {
            return this.link.store.getFreeCapacity(RESOURCE_ENERGY);
        }

        if (this.type === LinkType.SOURCE) {
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

        const sources: Source[] = this.link.room.find(FIND_SOURCES);
        for (let source of sources) {
            if (this.link.pos.getRangeTo(source) < 3) {
                return LinkType.SOURCE;
            }
        }

        return LinkType.UNKNOWN;
    }
}
