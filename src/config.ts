export const HARVESTERS_COUNT = 6;
export const HARVESTER_BODY = [WORK, CARRY, MOVE];
export const HARVESTER_ADVANCED_BODY = [WORK, WORK, CARRY, MOVE, MOVE];
export const HARVESTER_SUPER_ADVANCED_BODY = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];

export const MINERS_COUNT = 2;
export const MINER_BODY = [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];

export const GUARDS_COUNT = 1;
export const GUARD_BODY = [TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK];

export const BUILDERS_COUNT = 1;
export const BUILDERS_ENERGY_LIMIT = 200;
export const BUILDER_BODY = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];

export const UPGRADERS_COUNT = 1;
export const UPGRADERS_ENERGY_LIMIT = 0;
export const UPGRADER_BODY = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];

export const REPAIRERS_COUNT = 3;
export const REPAIRER_BODY = [WORK, WORK, CARRY, CARRY, MOVE];
export const REPAIRER_ADVANCED_BODY = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
export const REPAIRER_HEALTH_LIMIT_RATIO = 0.6;
export const WALL_KEEPERS_COUNT = 2;
export const WALL_DESIRED_HITS = 40000;
export const WALL_KEEPER_BODY = REPAIRER_ADVANCED_BODY;

export const SPAWN_KEEPERS_COUNT = 2;
export const SPAWN_KEEPER_BODY = [CARRY, CARRY, MOVE, MOVE];

export const GRAVE_KEEPERS_COUNT = 2;
export const GRAVE_KEEPER_BODY = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];

export const ENERGY_AGGREGATORS_COUNT = 2;
export const ENERGY_AGGREGATOR_BODY = [CARRY, CARRY, CARRY, MOVE, MOVE];
export const ENERGY_AGGREGATOR_ADVANCED_BODY = [CARRY, CARRY, CARRY, MOVE, MOVE];
export const LINK_KEEPERS_COUNT = 1;
export const ENERGY_CENTER = 'ENERGY_CENTER';
export const UPGRADE_LINK = 'UPGRADE_LINK';

export const TTL_UNTIL_RENEW = 100;
export const TTL_RENEW_LIMIT = 600;
export const RENEW_CREEPS = false;
export const SUICIDE_CREEPS = true;

export const RESOURCE_ASSIGN_NORMALIZE_DISTANCE = false;
export const RESOURCE_ASSIGN_ALGO_VERSION = 15;
