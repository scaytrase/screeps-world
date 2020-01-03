import BaseCreepRole from "./role.base_creep";

const TARGET_FIELD = 'target';

export default abstract class TargetAwareCreepRole<T extends Structure | ConstructionSite | Source> extends BaseCreepRole {
    run(creep: Creep, game: Game): void {
        this.renewTarget(creep, game);

        this.doRun(creep, game);
    }

    protected getCurrentTargetId(creep: Creep): Id<any> | null {
        return creep.memory[TARGET_FIELD];
    }

    protected getCurrentStructureTarget(creep: Creep): T | null {
        return Game.getObjectById(this.getCurrentTargetId(creep));
    }

    protected setTarget(creep: Creep, target: T | null): void {
        creep.memory[TARGET_FIELD] = undefined;
        if (target) {
            creep.memory[TARGET_FIELD] = target.id;
        }
    }

    protected abstract shouldRenewTarget(creep: Creep, game: Game): boolean;

    protected abstract getTarget(creep: Creep, game: Game): T;

    protected renewTarget(creep: Creep, game: Game): void {
        const noTarget = this.getCurrentStructureTarget(creep) === null;
        const shouldRenew = this.shouldRenewTarget(creep, game);
        if (noTarget || shouldRenew) {
            this.setTarget(creep, this.getTarget(creep, game));
        }
    }

    protected abstract doRun(creep: Creep, game: Game): void ;
}
