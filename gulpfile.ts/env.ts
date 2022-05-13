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
    googleRecaptchaToken: string;
    rsyncConfig: RsyncConfig;
}
