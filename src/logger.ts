import {DEBUG} from "./config";

export default class Logger {
    public static debug(...args) {
        if (!DEBUG) {
            return;
        }

        console.log('[DEBUG]', ...args);
    }

    public static info(...args) {
        console.log('[INFO ]', ...args);
    }

    public static warn(...args) {
        console.log('[WARN ]', ...args);
    }
}
