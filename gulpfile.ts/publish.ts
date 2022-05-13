import { ANY_FILE, DIST_PATH, distPath } from "./paths";
import { src } from "gulp";

const gulpRsync = require("gulp-rsync");
const keyfile =
    "keyfile";

interface RsyncConfig {
    keyfile: string;
    username: string;
    hostname: string;
}

const rsyncConfig = (config: RsyncConfig) => ({
    options: {
        chmod: "Du=rwx,Dgo=rx,Fu=rw,Fgo=r",
        e: `ssh -i "${config.keyfile}"`,
    },
    username: config.username,
    hostname: config.hostname,
    destination: "path",
    recursive: true,
    silent: true,
    root: DIST_PATH,
    progress: false,
});

export const publish = () => {
    const config = rsyncConfig({
        keyfile: keyfile,
        username: "username",
        "",
    });
    console.log(JSON.stringify(config, null, 2));

    return src(distPath(ANY_FILE))
        .pipe(gulpRsync(config))
        .on("error", (err: Error) => {
            console.log(JSON.stringify(err, null, 2));
        });
};
