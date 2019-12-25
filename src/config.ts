export const BASE_WORKER_CREEP_BODY = [WORK, CARRY, MOVE];
export const WORKER_CREEP_BODY_LVL2 = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
export const WORKER_CREEP_BODY_LVL3 = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
export const WORKER_CREEP_BODY_LVL4 = [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
export const WORKER_CREEP_BODY_LVL5 = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
export const WORKER_CREEP_BODY_LVL6 = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
export const WORKER_CREEP_BODY_LVL7 = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];

export const BASE_CARRIER_CREEP_BODY = [CARRY, CARRY, MOVE];
export const CARRIER_CREEP_BODY_LVL2 = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE];
export const CARRIER_CREEP_BODY_LVL3 = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
export const CARRIER_CREEP_BODY_LVL4 = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];

export const HARVESTERS_COUNT_LIMIT = 4;
export const HARVESTERS_EMERGENCY_COUNT_LIMIT = 6;
export const HARVESTER_BODY = WORKER_CREEP_BODY_LVL3;

export const ENERGY_AGGREGATORS_COUNT_LIMIT = 2; // @todo 0 for low economy
export const ENERGY_AGGREGATOR_BODY = CARRIER_CREEP_BODY_LVL3;

export const MINERS_COUNT_LIMIT = 2; // @todo 0 for low economy or no mine
export const MINER_BODY = WORKER_CREEP_BODY_LVL3;

export const GUARDS_COUNT_LIMIT = 1;
export const GUARD_BODY = [TOUGH, TOUGH, MOVE, MOVE, ATTACK];
// export const GUARD_BODY = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK];

export const RANGE_GUARDS_COUNT_LIMIT = 0;
export const RANGE_GUARD_BODY = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK];

export const BUILDERS_COUNT_LIMIT = 3; // @todo 1 or 0 for low economy
export const BUILDER_BODY = WORKER_CREEP_BODY_LVL3;

export const UPGRADERS_COUNT_LIMIT = 3; // @todo 1 for low economy
export const UPGRADER_BODY = WORKER_CREEP_BODY_LVL3;

export const REPAIRERS_COUNT_LIMIT = 2; // @todo 1 or 0 for low economy
export const REPAIRER_BODY = WORKER_CREEP_BODY_LVL3;
export const REPAIRER_HEALTH_LIMIT_RATIO = 0.7; // @todo 0.3 for low economy

export const WALL_KEEPERS_COUNT_LIMIT = 0;
export const RAMPART_INITIAL_HITS = 5000;
export const WALL_DESIRED_HITS_LOW = 50000;
export const WALL_DESIRED_HITS_HIGH = 70000;
export const WALL_KEEPER_BODY = BASE_WORKER_CREEP_BODY;

export const SPAWN_KEEPERS_COUNT_LIMIT = 2; // @todo 1 for low economy
export const SPAWN_KEEPER_BODY = CARRIER_CREEP_BODY_LVL3;

export const TOWER_KEEPERS_COUNT_LIMIT = 0;
export const TOWER_KEEPER_BODY = BASE_CARRIER_CREEP_BODY;

export const RESOURCE_AGGREGATORS_COUNT_LIMIT = 0;
export const RESOURCE_AGGREGATOR_BODY = CARRIER_CREEP_BODY_LVL3;

export const GRAVE_KEEPERS_COUNT_LIMIT = 2; // @todo 0 for low economy
export const GRAVE_KEEPER_BODY = CARRIER_CREEP_BODY_LVL3;
export const GRAVE_KEEPERS_LOOT_BORDERS = true;

export const LINK_KEEPER_BODY = CARRIER_CREEP_BODY_LVL4;

export const SUICIDE_CREEPS = true;
export const SUICIDE_TTL = 50;

export const RESOURCE_ASSIGN_ALGO_VERSION = 15;

export const TOWER_RANGE = 50;
export const TOWER_ATTACK_BORDERS = false;
export const GUARDS_ATTACK_BORDERS = false;


export const TERMINAL_ENERGY_REQUIREMENT = 5000;
export const TERMINAL_RESOURCE_CARRIERS_COUNT_LIMIT = 1;

