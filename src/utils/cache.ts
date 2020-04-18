export default class GameCache<T> {
    private readonly cache: Map<string, CacheRecord<T>> = new Map<string, CacheRecord<T>>();

    public set(key: string, value: T, ttl: number | null = null): void {
        this.cache.set(key, new CacheRecord<T>(value, Game.time, ttl));
    }

    public get(key: string): CacheRecord<T> | undefined {
        const item = this.cache.get(key);

        if (!item || item.isExpired()) {
            return undefined;
        }

        return item;
    }

    public delete(key: string): void {
        this.cache.delete(key);
    }

    public getCached(key: string, ttl: number | null, generator: () => T): T {
        const cached = this.get(key);
        if (cached !== undefined) {
            return cached.value;
        }

        const value: T = generator();
        this.set(key, value, ttl);

        return value;
    }
}

class CacheRecord<T> {
    public readonly value: T;
    private readonly timestamp: number;
    private readonly ttl: number | null;

    constructor(value: T, timestamp: number, ttl: number | null) {
        this.value = value;
        this.timestamp = timestamp;
        this.ttl = ttl;
    }

    public isExpired(): boolean {
        if (this.ttl === null) {
            return false;
        }

        return Game.time > this.timestamp + this.ttl;
    }
}
