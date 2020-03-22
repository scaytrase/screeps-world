function generateBody(pattern: BodyPartConstant[], level: number): BodyPartConstant[] {
    return pattern.map(part => Array(level).fill(part)).reduce((p, c) => [...p, ...c]);
}

function generateBodySet(pattern: BodyPartConstant[], level: number): BodyPartConstant[][] {
    return Array<number>(level).fill(0).map((index, level) => generateBody(pattern, level + 1)).reverse();
}

export const BASE_WORKER_CREEP_BODY = [WORK, CARRY, MOVE];
export const WORKER_BODIES = generateBodySet(BASE_WORKER_CREEP_BODY, 15);

export const BASE_CARRIER_CREEP_BODY = [CARRY, CARRY, MOVE];
export const CARRIER_BODIES = generateBodySet(BASE_CARRIER_CREEP_BODY, 15);

export const BASE_ATTACKER_BODY = [TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK];
export const ATTACKER_BODIES = [...generateBodySet([TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, RANGED_ATTACK, HEAL, HEAL], 7), BASE_ATTACKER_BODY];
