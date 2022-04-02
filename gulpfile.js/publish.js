const gulpRsync = require("gulp-rsync");
const keyfile =
    "keyfile";

const rsyncConfig = config => ({
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

const publish = () => {
    const config = rsyncConfig({
        keyfile: keyfile,
        username: "username",
        "",
    });
    console.log(JSON.stringify(config, null, 2));

    return src(distPath(ANY_FILE))
        .pipe(gulpRsync(config))
        .on("error", err => {
            console.log(JSON.stringify(err, null, 2));
        });
};

exports.publish = publish;
