import fs from "fs";
// import { Colors } from "../enums";

const Colors = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",

  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m",

  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m",
};

export const readLog = (logFile) => {
  if (!logFile) {
    return;
  }

  return new Promise((resolve, reject) => {
    fs.readFile(logFile, "utf8", (err, contents) => {
      if (err) {
        reject(err);
      }

      const split = contents?.split(/\r?\n/);

      const result = split?.map((line) => {
        return JSON.parse(line);
      });

      resolve(result);
    });
  });
};

const toTime = (time) => new Date(time).toISOString();

const stdin = process.openStdin();

console.log("Enter log file path");

stdin.addListener("data", function (input) {
  const value = input.toString().trim();

  const results = readLog("src/logs/pexip-2021-05-25T06-23-49.542Z.log"); //readLog(`${value}`);

  results.then((result) => {
    const topic = result
      .filter((message) => {
        if (
          message.event?.topic &&
          message.event?.topic !== "6b3dd8e4-9c11-43d9-89dd-bb592b92f093"
        ) {
          return undefined;
        }

        return message;
      })
      .filter(Boolean);

    console.log(Colors.Reset, "");

    const names = topic
      .map((obj) => {
        if (obj.name) {
          return obj.name;
        }
      })
      .filter(Boolean);

    console.log(Colors.FgCyan, "names", [...new Set(names)]);

    const lighthouseEvents = topic
      .map((obj) => {
        if (obj.event?.type) {
          return obj.event.type;
        }
      })
      .filter(Boolean);

    console.log(Colors.Reset, "");

    console.log(Colors.FgCyan, "events", [...new Set(lighthouseEvents)]);

    console.log(Colors.Reset, "");

    topic.forEach((log) => {
      console.log(Colors.FgGreen, `${log.time} | ${toTime(log.time)}`);
      console.log(Colors.FgCyan, `name: ${log.name}`);

      log.msg ? console.log(Colors.Reset, `message: ${log.msg}`) : "";

      log.isTrusted
        ? console.log(Colors.Reset, `isTrusted: ${log.isTrusted}`)
        : "";

      if (log.name === "router") {
        console.log(
          "\x1b[0m",
          `title: ${log.url?.state?.title}, url: ${log.url?.path}`
        );
      }

      log.mute !== undefined
        ? console.log(Colors.FgCyan, `mute: ${log.mute}`)
        : "";

      if (log.event?.type) {
        console.log(Colors.FgYellow, `type: ${log.event.type}`);

        if (log.event?.type === "media") {
          console.log(Colors.FgCyan, `audio: ${log.event.audio}`);
        }

        if (log.event?.type === "member") {
          console.log(Colors.FgCyan, `can: ${JSON.stringify(log.event.can)}`);
        }
      }

      console.log("");
    });
  });
});
