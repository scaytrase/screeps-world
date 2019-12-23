export enum LinkType {
    DEMAND = 'controller',
    SOURCE = 'source',
    STORAGE = 'storage',
    UNKNOWN = 'unknown',
}

export default class LinkProxy {
    public readonly link: StructureLink;
    public readonly type: LinkType;
    private readonly game: Game;
    private amount: number;

    constructor(link: StructureLink, game: Game) {
        this.link = link;
        this.game = game;
        this.type = this.detectType();
        this.amount = this.getInitialAmount();
    }

    public getAmount(): number {
        return this.amount;
    }

    public withdraw(link: LinkProxy, amount: number): void {
        link.link.transferEnergy(this.link, amount);
        this.amount += amount;
        link.amount -= amount;
    }

    public transfer(link: LinkProxy, amount: number): void {
        this.link.transferEnergy(link.link, amount);
        this.amount -= amount;
        link.amount += amount;
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
        if (this.link.pos.getRangeTo(this.link.room.controller) < 5) {
            return LinkType.DEMAND;
        }

        if (this.link.pos.getRangeTo(this.link.room.storage) < 2) {
            return LinkType.STORAGE;
        }

        const sources: Source[] = this.link.room.find(FIND_SOURCES);
        for (let source of sources) {
            if (this.link.pos.getRangeTo(source) < 2) {
                return LinkType.SOURCE;
            }
        }

        return LinkType.UNKNOWN;
    }
}