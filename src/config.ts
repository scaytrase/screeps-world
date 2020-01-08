// UTILS
export const DEBUG = false;
export const RESOURCE_ASSIGN_ALGO_VERSION = 15;
export const RESOURCE_CACHE_TTL = 5;
export const WALKABLE_CACHE_TTL = 25;

// PER-ROOM LIMITS
export const ENERGY_AGGREGATORS_COUNT_LIMIT = 1; // @todo 0 for low economy
export const GUARDS_COUNT_LIMIT = 1;
export const BUILDERS_COUNT_LIMIT = 2; // @todo 1 or 0 for low economy
export const REPAIRERS_COUNT_LIMIT = 1; // @todo 1 or 0 for low economy
export const WALL_KEEPERS_COUNT_LIMIT = 1;
export const SPAWN_KEEPERS_COUNT_LIMIT = 2; // @todo 1 for low economy, 2 for high economy
export const TOWER_KEEPERS_COUNT_LIMIT = 1;
export const RESOURCE_AGGREGATORS_COUNT_LIMIT = 1;
export const GRAVE_KEEPERS_COUNT_LIMIT = 1; // @todo 0 for low economy
export const TERMINAL_RESOURCE_CARRIERS_COUNT_LIMIT = 1;

// PER-ROOM HARD LIMITS (actual limit by body parts)
export const UPGRADERS_COUNT_LIMIT = 4;

// GLOBALS
export const PARKING_SLEEP_TIME = 5;

export const MAX_WORK_PER_RESOURCE = 6;
export const MAX_WORK_PER_CONTROLLER = 12;
export const MAX_WORK_PER_CONTROLLER_EMERGENCY = 2;

export const UPGRADE_REMOTE_ROOMS_UP_TO_LEVEL = 3;
export const BUILD_REMOTE_ROOMS_UP_TO_LEVEL = 3;
export const MIN_ECONOMY_FOR_REMOTE_CREEP_PRODUCERS = 30000;
export const REMOTE_BUILDERS_COUNT_LIMIT = 2;
export const REMOTE_UPGRADERS_COUNT_LIMIT = 4;

export const REPAIRER_HEALTH_UPPER_RATIO = 0.9; // @todo 0.5 for low economy
export const REPAIRER_HEALTH_LOWER_RATIO = 0.5; // @todo 0.3 for low economy
export const REPAIRER_HEALTH_EMERGENCY_RATIO = 0.10;

export const RAMPART_INITIAL_HITS = 5000;
export const WALL_DESIRED_HITS_LOW = 50000;
export const WALL_DESIRED_HITS_HIGH = 70000;

export const TOWER_RANGE = 50;

export const BORDER_WIDTH = 1;
export const TOWER_ATTACK_BORDERS = false;
export const GUARDS_ATTACK_BORDERS = false;
export const GRAVE_KEEPERS_LOOT_BORDERS = true;

export const TERMINAL_ENERGY_REQUIREMENT = 50000;
