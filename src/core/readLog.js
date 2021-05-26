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
    logFile =
      "/Users/shimiz/Documents/projects/log-reader/src/logs/pexip-2021-05-25T06-23-49.542Z.log";
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

  const results = readLog(`${value}`);

  results.then((result) => {
    const topicId = result?.find((log) => log?.payload?.type === "member")
      ?.payload?.topic;

    const topicLogs = result
      .filter((message) => {
        if (message.event?.topic && message.event?.topic !== topicId) {
          return undefined;
        }

        return message;
      })
      .filter(Boolean);

    console.log(
      `${Colors.FgYellow}${Colors.Underscore}Log summary:${Colors.Reset}\n`
    );

    console.log(`${Colors.FgCyan} topic: ${topicId}\n`);

    const names = topicLogs
      .map((obj) => {
        if (obj.name) {
          return obj.name;
        }
      })
      .filter(Boolean);

    console.log(
      Colors.FgYellow,
      `${Colors.Underscore}Log names:${Colors.Reset}`
    );

    [...new Set(names)].forEach((name) =>
      console.log(`${Colors.FgCyan} ${name}`)
    );

    const lighthouseEvents = topicLogs
      .map((obj) => {
        if (obj.event?.type) {
          return obj.event.type;
        }
      })
      .filter(Boolean);

    console.log(Colors.Reset);

    console.log(
      Colors.FgYellow,
      `${Colors.Underscore}lighthouse events:${Colors.Reset}`
    );

    console.log(Colors.FgCyan, [...new Set(lighthouseEvents)].join(" "));

    console.log(Colors.Reset);

    console.log(Colors.FgYellow, `${Colors.Underscore}Log:${Colors.Reset}\n`);

    topicLogs.forEach((log) => {
      const mediaEvents = {};

      console.log(Colors.FgGreen, `${log.time} | ${toTime(log.time)}`);
      console.log(Colors.FgCyan, `name: ${log.name}`);

      log.msg ? console.log(Colors.FgYellow, `message: ${log.msg}`) : "";

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

      if (log?.name === "lighthouse") {
      }

      const nextMediaEvent =
        log?.name === "lighthouse" ? log.event || log.payload : undefined;

      if (nextMediaEvent) {
        console.log(Colors.FgYellow, `type: ${nextMediaEvent.type}`);
        nextMediaEvent.at
          ? console.log(Colors.FgGreen, `at: ${nextMediaEvent.at}`)
          : "";

        if (nextMediaEvent?.type === "media") {
          console.log(Colors.FgCyan, `audio: ${nextMediaEvent.audio}`);
        }

        if (nextMediaEvent?.type === "member") {
          console.log(
            Colors.FgCyan,
            `can: ${JSON.stringify(nextMediaEvent.can)}`
          );
        }

        if (nextMediaEvent?.at && mediaEvents[nextMediaEvent.callId]?.at) {
          if (
            new Date(nextMediaEvent.at).valueOf() <
            new Date(mediaEvents[nextMediaEvent.callId].at).valueOf()
          ) {
            console.log(
              Colors.FgRed,
              "out of order! 🤪",
              `previous ${mediaEvents[nextMediaEvent.callId]?.at}`,
              `next ${nextMediaEvent?.at}`
            );
          }
        }

        mediaEvents[nextMediaEvent.callId] = nextMediaEvent;
      }

      console.log("");
    });
  });
});
