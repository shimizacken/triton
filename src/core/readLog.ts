import * as fs from "fs";
import { state } from "../state/state.js";
import { initRenderer } from "../vendors/renderer.js";
import type { LogEntry } from "../types";

export const readLog = (logFile?: string): Promise<LogEntry[]> => {
  if (!logFile) {
    logFile = "src/test/logs/pexip-2021-05-28T11-40-31.486Z.log";
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
  initRenderer(console.log)(state);
};

main();
