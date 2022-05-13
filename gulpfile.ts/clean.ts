import { ANY_FILE, buildPath, distPath } from "./paths";
import del from "del";

export const clean = async () =>
    del.sync([buildPath(ANY_FILE), distPath(ANY_FILE)]);

export const cleanTemp = async () =>
    del.sync([
        // buildPath(ANY_FILE),
        distPath("/apps/"),
    ]);
