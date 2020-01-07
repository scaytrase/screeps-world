import CreepTrait from "./creep_traits";
import TargetAwareCreepRole from "./role.target_aware_creep";

export default abstract class WorkRestCycleCreepRole<T extends ConstructionSite | Structure | Source> extends TargetAwareCreepRole<T> {
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

    protected abstract shouldWork(creep: Creep): boolean;

    protected abstract shouldRest(creep: Creep): boolean;

    protected abstract work(creep: Creep): void;

    protected abstract rest(creep: Creep): void;

    protected doRun(creep: Creep): void {
        this.updateState(creep);
        this.performState(creep);
    }

    private performState(creep: Creep) {
        if (this.getCurrentStructureTarget(creep)) {
            if (WorkRestCycleCreepRole.isWorking(creep)) {
                this.work(creep);
            } else {
                this.rest(creep);
            }
        } else {
            CreepTrait.goToParking(creep);
        }
    }

    private updateState(creep: Creep) {
        if (WorkRestCycleCreepRole.isWorking(creep) && this.shouldRest(creep)) {
            WorkRestCycleCreepRole.stopWorking(creep);
        } else if (!WorkRestCycleCreepRole.isWorking(creep) && this.shouldWork(creep)) {
            WorkRestCycleCreepRole.startWorking(creep);
        }
    }

}
