import BaseCreepRole from "./role.base_creep";

export default abstract class TargetAwareCreepRole extends BaseCreepRole {
    run(creep: Creep, game: Game): void {
        this.renewTarget(creep, game);

        this.doRun(creep, game);
    }

    protected getCurrentTargetId(creep: Creep): string | null {
        return creep.memory['target'];
    }

    protected getCurrentStructureTarget(creep: Creep): AnyStructure | null {
        return Game.getObjectById(this.getCurrentTargetId(creep));
    }

    protected setTarget(creep: Creep, target: AnyStructure | null): void {
        creep.memory['target'] = undefined;
        if (target) {
            creep.memory['target'] = target.id;
        }
    }

    protected abstract shouldRenewTarget(creep: Creep, game: Game): boolean;

    protected abstract getTarget(creep: Creep, game: Game): AnyStructure;

    protected renewTarget(creep: Creep, game: Game): void {
        if (this.shouldRenewTarget(creep, game)) {
            this.setTarget(creep, this.getTarget(creep, game));
        }
    }

    protected abstract doRun(creep: Creep, game: Game): void ;
}
