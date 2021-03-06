import Activity from "../activity";

export default class CreepSpawnBound implements Activity {
    run(): void {
        for (const creep of Object.values(Game.creeps)) {
            if (creep.spawning) {
                continue;
            }

            if (creep.memory['spawn']) {
                const spawn = Game.getObjectById<StructureSpawn>(creep.memory['spawn']);
                if (spawn && spawn.room !== creep.room) {
                    creep.memory['target'] = undefined;
                    creep.memory['working'] = undefined;
                    creep.moveTo(
                        spawn, {
                            reusePath: 1,
                            visualizePathStyle: {stroke: '#ff55f4'}
                        });
                }
            }
        }
    }
}
