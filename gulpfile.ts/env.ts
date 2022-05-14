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
    googleRecaptchaToken: string;
    rsyncConfig: RsyncConfig;
}
