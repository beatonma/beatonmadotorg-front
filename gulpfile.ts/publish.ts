import { ANY_FILE, DIST_PATH, distPath } from "./paths";
import { src } from "gulp";
import { RsyncConfig } from "./env";
import { getEnvironment, isDevBuild } from "./setup";

const gulpRsync = require("gulp-rsync");

const rsyncConfig = (config: RsyncConfig) => ({
    options: {
        chmod: "Du=rwx,Dgo=rx,Fu=rw,Fgo=r",
        e: `ssh -i "${config.keyfile}"`,
    },
    username: config.username,
    hostname: config.hostname,
    destination: config.destinationPath,
    recursive: true,
    silent: true,
    root: DIST_PATH,
    progress: false,
});

export const publish = () => {
    if (isDevBuild()) {
        throw "Unexpected call to publish() in development build!";
    }
    const env = getEnvironment();
    const config = rsyncConfig(env.rsyncConfig);

    console.log(JSON.stringify(config, null, 2));

    return src(distPath(ANY_FILE))
        .pipe(gulpRsync(config))
        .on("error", (err: Error) => {
            console.log(JSON.stringify(err, null, 2));
        });
};
