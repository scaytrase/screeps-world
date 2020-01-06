export const MAX_WORK_PER_RESOURCE = 7;
export const MAX_WORK_PER_CONTROLLER = 7;

export const UPGRADE_REMOTE_ROOMS_UP_TO_LEVEL = 3;
export const BUILD_REMOTE_ROOMS_UP_TO_LEVEL = 4;
export const MIN_ECONOMY_FOR_REMOTE_CREEP_PRODUCERS = 30000;
export const REMOTE_BUILDERS_COUNT_LIMIT = 2;
export const REMOTE_UPGRADERS_COUNT_LIMIT = 4;

export const UPGRADERS_COUNT_LIMIT = 2; // @todo 1 for low economy

export const ENERGY_AGGREGATORS_COUNT_LIMIT = 1; // @todo 0 for low economy

export const GUARDS_COUNT_LIMIT = 1;
export const GUARD_BODY = [TOUGH, TOUGH, MOVE, MOVE, ATTACK];
// export const GUARD_BODY = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK];

export const RANGE_GUARDS_COUNT_LIMIT = 0;
export const RANGE_GUARD_BODY = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK];

export const BUILDERS_COUNT_LIMIT = 2; // @todo 1 or 0 for low economy

export const REPAIRERS_COUNT_LIMIT = 2; // @todo 1 or 0 for low economy
export const REPAIRER_HEALTH_UPPER_RATIO = 0.75; // @todo 0.5 for low economy
export const REPAIRER_HEALTH_LOWER_RATIO = 0.25; // @todo 0.3 for low economy
export const REPAIRER_HEALTH_EMERGENCY_RATIO = 0.10;

export const WALL_KEEPERS_COUNT_LIMIT = 0;
export const RAMPART_INITIAL_HITS = 5000;
export const WALL_DESIRED_HITS_LOW = 50000;
export const WALL_DESIRED_HITS_HIGH = 70000;

export const SPAWN_KEEPERS_COUNT_LIMIT = 2; // @todo 1 for low economy, 2 for high economy
export const TOWER_KEEPERS_COUNT_LIMIT = 1;

export const RESOURCE_AGGREGATORS_COUNT_LIMIT = 1;

export const GRAVE_KEEPERS_COUNT_LIMIT = 1; // @todo 0 for low economy
export const GRAVE_KEEPERS_LOOT_BORDERS = true;

export const SUICIDE_CREEPS = true;
export const SUICIDE_TTL = 30;

export const RESOURCE_ASSIGN_ALGO_VERSION = 15;

export const TOWER_RANGE = 50;
export const TOWER_ATTACK_BORDERS = false;
export const GUARDS_ATTACK_BORDERS = false;

export const DEBUG = false;

export const TERMINAL_ENERGY_REQUIREMENT = 50000;
export const TERMINAL_RESOURCE_CARRIERS_COUNT_LIMIT = 1;

