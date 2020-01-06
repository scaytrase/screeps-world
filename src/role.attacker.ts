import {GUARDS_ATTACK_BORDERS} from "./config";
import CreepTrait, {COLOR_SPECIAL_TASKS} from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import NotEmptyCallableResult from "./spawn_strategy.not_empty_callable_result";
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

    private static getFlag(game: Game): Flag {
        return [...Utils.getFlagsByColors(game, COLOR_RED, COLOR_RED)].shift();
    }

    run(creep: Creep, game: Game): void {
        const flag = AttackerRole.getFlag(game);
        if (creep.room.name !== flag.room.name) {
            creep.moveTo(flag, {visualizePathStyle: {stroke: COLOR_SPECIAL_TASKS}});
            return;
        }

        const target = AttackerRole.getTargets(creep.room)
            .sort(Utils.sortByDistance(creep))
            .shift();

        CreepTrait.attack(creep, target, {reusePath: 1});
    }

    getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy(
            [
                new NotEmptyCallableResult((game, spawn) => AttackerRole.getFlag(game)),
                new NotEmptyCallableResult((game, spawn) => AttackerRole.getTargets(AttackerRole.getFlag(game).room).shift()),
                new LimitedSpawnByRoleCountStrategy(2, this, () => 1, true),
            ]
        );
    }

    protected isSpawnBound(): boolean {
        return false;
    }

    protected getBody(game: Game): BodyPartConstant[] {
        return [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK];
    }

    protected getRoleName(): string {
        return 'attacker';
    }
}
