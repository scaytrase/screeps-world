import {GUARDS_ATTACK_BORDERS} from "../config/config";
import {ATTACKER_BODIES, BASE_ATTACKER_BODY} from "../config/const";
import CreepTrait from "../creep_traits";
import BaseCreepRole from "../base_roles/base_creep";
import {Sort} from "../utils/sort_utils";
import AndChainSpawnStrategy from "../spawn_strategy/and_chain";
import NotEmptyCallableResult from "../spawn_strategy/not_empty_callable_result";
import RoleCountStrategy from "../spawn_strategy/role_count";
import Utils from "../utils/utils";
import {COLOR_SPECIAL_TASKS} from "../config/colors";
import ProtoCreep from "../proto_creep";
import BodyFilter from "../utils/body_filter";

const IGNORED_STRUCTURES: StructureConstant[] = [STRUCTURE_RAMPART, STRUCTURE_WALL];

export default class AttackerRole extends BaseCreepRole {
    private static getTargets(room: Room): (Creep | Structure | null)[] {
        return [
            ...room
                .find(FIND_HOSTILE_CREEPS, {filter: (hostile: Creep) => GUARDS_ATTACK_BORDERS || Utils.isWithinTraversableBorders(hostile)}),
            ...room
                .find(FIND_HOSTILE_STRUCTURES, {filter: (structure: Structure) => !IGNORED_STRUCTURES.includes(structure.structureType)})
        ];
    }

    private static getFlag(): Flag {
        return [...Utils.getFlagsByColors(COLOR_RED, COLOR_RED)].shift();
    }

    run(creep: Creep): void {
        const flag = AttackerRole.getFlag();
        if (!flag.room || creep.room.name !== flag.room.name) {
            creep.moveTo(flag, {visualizePathStyle: {stroke: COLOR_SPECIAL_TASKS}});
            return;
        }

        if (creep.getActiveBodyparts(HEAL) > 0) {
            const friend = flag.room.find(FIND_MY_CREEPS).filter(creep => creep.hits < creep.hitsMax).sort(Sort.byDistance(creep)).shift();
            if (friend && creep.pos.inRangeTo(friend, 2)) {
                creep.rangedHeal(friend);
            } else {
                creep.moveTo(friend);
            }
        }

        const hostile = AttackerRole.getTargets(creep.room)
            .sort(Sort.byDistance(creep))
            .shift();

        CreepTrait.attack(creep, hostile, {reusePath: 1});
    }

    public getRoleName(): string {
        return 'attacker';
    }

    protected createPrototype(spawn: StructureSpawn): ProtoCreep | null {
        const strategy = new AndChainSpawnStrategy(
            [
                new NotEmptyCallableResult((spawn) => AttackerRole.getFlag()),
                new NotEmptyCallableResult((spawn) => !AttackerRole.getFlag().room || AttackerRole.getTargets(AttackerRole.getFlag().room).shift()),
                RoleCountStrategy.global(0, this),
            ]
        );

        if (strategy.shouldSpawn(spawn)) {
            return new ProtoCreep(
                Utils.getBiggerPossibleBody(ATTACKER_BODIES.filter(BodyFilter.byPartsCount(6, [ATTACK, RANGED_ATTACK])), BASE_ATTACKER_BODY, spawn),
                this.getDefaultMemory(spawn));
        }

        return null;
    }

    protected isSpawnBound(): boolean {
        return false;
    }
}
