import BaseCreepRole from "./base_creep";

const TARGET_FIELD = 'target';

export default abstract class TargetAwareCreepRole<T extends Structure | ConstructionSite | Source> extends BaseCreepRole {
    run(creep: Creep): void {
        this.renewTarget(creep);

        this.doRun(creep);
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

    protected abstract shouldRenewTarget(creep: Creep): boolean;

    protected abstract getTarget(creep: Creep): T;

    protected renewTarget(creep: Creep): void {
        const noTarget = this.getCurrentStructureTarget(creep) === null;
        const shouldRenew = this.shouldRenewTarget(creep);
        if (noTarget || shouldRenew) {
            this.setTarget(creep, this.getTarget(creep));
        }
    }

    protected abstract doRun(creep: Creep): void ;
}
