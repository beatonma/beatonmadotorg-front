import gulpReplace from "gulp-replace";
import { getEnvironment } from "./setup";

export interface RsyncConfig {
    keyfile: string;
    username: string;
    hostname: string;
    destinationPath: string;
}

/**
 * Expected implementations:
 * - DevelopmentEnv in ./env-development.ts
 * - ProductionEnv in ./env-production.ts
 */
export interface Env {
    contactEmail: string;
    gitHash?: string;
    googleRecaptchaToken: string;
    rsyncConfig: RsyncConfig;
}

export const includeEnv = () =>
    gulpReplace(/__env__:(\w+)/g, (match: string, key: string) => {
        const env = getEnvironment();
        if (Object.keys(env).includes(key)) {
            return env[key as keyof Env] as string;
        } else {
            throw `Unknown environment key ${key}`;
        }
    });
