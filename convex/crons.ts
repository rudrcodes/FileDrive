import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";


const crons = cronJobs();

crons.interval(
    "delete old files marked for deletion",
    { minutes: 20 },
    internal.files.deleteAllFiles
);


export default crons