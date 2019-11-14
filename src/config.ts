export const USE_PERMANENT_SAFE_MODE = false;

export const HARVESTERS_COUNT = 6;
export const HARVESTER_BODY = [WORK, CARRY, MOVE];
export const HARVESTER_ADVANCED_BODY = [WORK, WORK, CARRY, MOVE, MOVE];
export const HARVESTER_SUPER_ADVANCED_BODY = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];

export const GUARDS_COUNT = 3;
export const GUARD_BODY = [TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK];

export const BUILDERS_COUNT = 2;
export const BUILDERS_ENERGY_LIMIT = 200;
export const BUILDER_BODY = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];

export const UPGRADERS_COUNT = 6;
export const UPGRADERS_ENERGY_LIMIT = 200;
export const UPGRADER_BODY = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];

export const REPAIRERS_COUNT = 5;
export const REPAIRER_BODY = [WORK, WORK, CARRY, CARRY, MOVE];
export const REPAIRER_ADVANCED_BODY = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
export const REPAIRER_HEALTH_LIMIT_RATIO = 0.75;

export const SPAWN_KEEPERS_COUNT = 2;
export const SPAWN_KEEPER_BODY = [CARRY, CARRY, MOVE, MOVE];

export const GRAVE_KEEPERS_COUNT = 1;
export const GRAVE_KEEPER_BODY = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];

export const ENERGY_AGGREGATORS_COUNT = 5;
export const ENERGY_AGGREGATOR_BODY = [CARRY, CARRY, CARRY, MOVE, MOVE];
export const ENERGY_AGGREGATOR_ADVANCED_BODY = [CARRY, CARRY, CARRY, MOVE, MOVE];
export const ENERGY_AGGREGATOR_LIMIT = 0.1;
export const ENERGY_CENTER = 'ENERGY_CENTER';

export const TTL_UNTIL_RENEW = 100;
export const TTL_RENEW_LIMIT = 600;
export const RENEW_CREEPS = false;
export const SUICIDE_CREEPS = true;

export const RESOURCE_ASSIGN_NORMALIZE_DISTANCE = false;
export const RESOURCE_ASSIGN_ALGO_VERSION = 11;
