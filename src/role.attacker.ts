import {GUARDS_ATTACK_BORDERS} from "./config";
import {ATTACKER_BODIES, BASE_ATTACKER_BODY} from "./const";
import CreepTrait, {COLOR_SPECIAL_TASKS} from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import {Sort} from "./sort_utils";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import NotEmptyCallableResult from "./spawn_strategy.not_empty_callable_result";
import RoleCountStrategy from "./spawn_strategy.role_count";
import Utils from "./utils";

export default class AttackerRole extends BaseCreepRole {
    private static getTargets(room: Room): (Creep | Structure | null)[] {
        return [
            ...room
                .find(FIND_HOSTILE_CREEPS, {filter: (hostile: Creep) => GUARDS_ATTACK_BORDERS || Utils.isWithinTraversableBorders(hostile)}),
            ...room
                .find(FIND_HOSTILE_STRUCTURES, {filter: (hostile: Creep) => GUARDS_ATTACK_BORDERS || Utils.isWithinTraversableBorders(hostile)})
        ];
    }

    private static getFlag(): Flag {
        return [...Utils.getFlagsByColors(COLOR_RED, COLOR_RED)].shift();
    }

    run(creep: Creep): void {
        const flag = AttackerRole.getFlag();
        if (creep.room.name !== flag.room.name) {
            creep.moveTo(flag, {visualizePathStyle: {stroke: COLOR_SPECIAL_TASKS}});
            return;
        }

        const target = AttackerRole.getTargets(creep.room)
            .sort(Sort.byDistance(creep))
            .shift();

        CreepTrait.attack(creep, target, {reusePath: 1});
    }

    getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy(
            [
                new NotEmptyCallableResult((spawn) => AttackerRole.getFlag()),
                new NotEmptyCallableResult((spawn) => AttackerRole.getTargets(AttackerRole.getFlag().room).shift()),
                RoleCountStrategy.global(2, this),
            ]
        );
    }

    public getRoleName(): string {
        return 'attacker';
    }

    protected isSpawnBound(): boolean {
        return false;
    }

    protected getBody(spawn: StructureSpawn): BodyPartConstant[] {
        const bodies = ATTACKER_BODIES.filter(body => body.filter(part => part === ATTACK || part === RANGED_ATTACK).length <= 5);

        return Utils.getBiggerPossibleBody(bodies, BASE_ATTACKER_BODY, spawn);
    }
}
