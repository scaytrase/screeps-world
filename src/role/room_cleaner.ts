import {ATTACKER_BODIES, BASE_ATTACKER_BODY} from "../config/const";
import CreepTrait from "../creep_traits";
import BaseCreepRole from "../base_roles/base_creep";
import {Sort} from "../utils/sort_utils";
import SpawnStrategy from "../spawn_strategy";
import AndChainSpawnStrategy from "../spawn_strategy/and_chain";
import NotEmptyCallableResult from "../spawn_strategy/not_empty_callable_result";
import RoleCountStrategy from "../spawn_strategy/role_count";
import Utils from "../utils/utils";
import {COLOR_SPECIAL_TASKS} from "../config/colors";


const ALLOWED_STRUCTURES: StructureConstant[] = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_LINK, STRUCTURE_LAB, STRUCTURE_FACTORY, STRUCTURE_TERMINAL, STRUCTURE_RAMPART, STRUCTURE_TOWER];

export default class RoomCleanerRole extends BaseCreepRole {
    private static getTargets(room: Room): (Creep | Structure | null)[] {
        return [
            ...room
                .find(FIND_HOSTILE_STRUCTURES, {
                    filter: (structure: Structure) =>
                        ALLOWED_STRUCTURES.includes(structure.structureType)
                        && (!structure['store'] || structure['store'].getUsedCapacity() === 0)
                })
        ];
    }

    private static getFlag(): Flag {
        return [...Utils.getFlagsByColors(COLOR_RED, COLOR_WHITE)].shift();
    }

    run(creep: Creep): void {
        const flag = RoomCleanerRole.getFlag();
        if (!flag) {
            creep.suicide();
            return;
        }

        if (!flag.room || creep.room.name !== flag.room.name) {
            creep.moveTo(flag, {visualizePathStyle: {stroke: COLOR_SPECIAL_TASKS}});
            return;
        }

        const hostile = RoomCleanerRole.getTargets(creep.room)
            .sort(Sort.byDistance(creep))
            .shift();

        CreepTrait.attack(creep, hostile);
    }

    getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy(
            [
                new NotEmptyCallableResult((spawn) => RoomCleanerRole.getFlag()),
                new NotEmptyCallableResult((spawn) => !RoomCleanerRole.getFlag().room || RoomCleanerRole.getTargets(RoomCleanerRole.getFlag().room).shift()),
                RoleCountStrategy.global(1, this),
            ]
        );
    }

    public getRoleName(): string {
        return 'room_wiper';
    }

    protected isSpawnBound(): boolean {
        return false;
    }

    protected getBody(spawn: StructureSpawn): BodyPartConstant[] {
        const bodies = ATTACKER_BODIES.filter(body => body.filter(part => part === ATTACK || part === RANGED_ATTACK).length <= 3);

        return Utils.getBiggerPossibleBody(bodies, BASE_ATTACKER_BODY, spawn);
    }
}
