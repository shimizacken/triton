import * as fs from "fs";
import { state } from "../state/state.js";
import { initTerminal } from "../vendors/terminal.js";
import type { LogEntry } from "../types";

export const readLog = (logFile?: string): Promise<LogEntry[]> => {
  if (!logFile) {
    logFile =
      "/Users/shimiz/Documents/projects/log-reader/src/test/logs/pexip-2021-05-25T06-23-49.542Z.log";
  }

  return new Promise((resolve, reject) => {
    fs.readFile(logFile, "utf8", (err, contents) => {
      if (err) {
        reject(err);
      }

      const split = contents?.toString()?.split(/\r?\n/);

      const result = split?.map((line) => JSON.parse(line));

      resolve(result);
    });
  });
};

export const main = () => {
  initTerminal(state);
};

main();
