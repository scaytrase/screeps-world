import TargetAwareCreepRole from "./role.target_aware_creep";

export default abstract class WorkRestCycleCreepRole<T extends ConstructionSite | Structure> extends TargetAwareCreepRole<T> {
    private static isWorking(creep: Creep): boolean {
        return creep.memory['working'] || false;
    }

    private static stopWorking(creep: Creep): void {
        creep.memory['working'] = false;
        creep.say('🔄 rest');
    }

    private static startWorking(creep: Creep): void {
        creep.memory['working'] = true;
        creep.say('⚡ work');
    }

    protected abstract shouldWork(creep: Creep, game: Game): boolean;

    protected abstract shouldRest(creep: Creep, game: Game): boolean;

    protected abstract work(creep: Creep, game: Game): void;

    protected abstract rest(creep: Creep, game: Game): void;

    protected doRun(creep: Creep, game: Game): void {
        this.updateState(creep, game);
        this.performState(creep, game);
    }

    private performState(creep: Creep, game: Game) {
        if (WorkRestCycleCreepRole.isWorking(creep)) {
            this.work(creep, game);
        } else {
            this.rest(creep, game);
        }
    }

    private updateState(creep: Creep, game: Game) {
        if (WorkRestCycleCreepRole.isWorking(creep) && this.shouldRest(creep, game)) {
            WorkRestCycleCreepRole.stopWorking(creep);
        } else if (!WorkRestCycleCreepRole.isWorking(creep) && this.shouldWork(creep, game)) {
            WorkRestCycleCreepRole.startWorking(creep);
        }
    }

}
