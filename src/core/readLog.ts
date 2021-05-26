import * as fs from "fs";
import { ANSIFontStyling } from "../enums.js";
import type { LighthouseEvent } from "../types";
import { toTime } from "../utils/utils.js";

export const readLog = (logFile?: string): Promise<LighthouseEvent[]> => {
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

      const result = split?.map((line) => {
        return JSON.parse(line);
      });

      resolve(result);
    });
  });
};

const stdin = process.openStdin();

console.log("Enter log file path: ");

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
      `${ANSIFontStyling.FgYellow}${ANSIFontStyling.Underscore}Log summary:${ANSIFontStyling.Reset}\n`
    );

    console.log(`${ANSIFontStyling.FgCyan} topic: ${topicId}\n`);

    const names = topicLogs
      .map((obj) => {
        if (obj.name) {
          return obj.name;
        }
      })
      .filter(Boolean);

    console.log(
      ANSIFontStyling.FgYellow,
      `${ANSIFontStyling.Underscore}Log names:${ANSIFontStyling.Reset}`
    );

    new Set(names).forEach((name) =>
      console.log(`${ANSIFontStyling.FgCyan} ${name}`)
    );

    const lighthouseEvents = topicLogs
      .map((obj) => {
        if (obj.event?.type) {
          return obj.event.type;
        }
      })
      .filter(Boolean);

    console.log(ANSIFontStyling.Reset);

    console.log(
      ANSIFontStyling.FgYellow,
      `${ANSIFontStyling.Underscore}lighthouse events:${ANSIFontStyling.Reset}`
    );

    console.log(
      ANSIFontStyling.FgCyan,
      Array.from(new Set(lighthouseEvents)).join(", ")
    );

    console.log(ANSIFontStyling.Reset);

    console.log(
      ANSIFontStyling.FgYellow,
      `${ANSIFontStyling.Underscore}Log:${ANSIFontStyling.Reset}\n`
    );

    const mediaEvents = {};

    topicLogs.forEach((log) => {
      console.log(ANSIFontStyling.FgGreen, `${log.time} | ${toTime(log.time)}`);
      console.log(ANSIFontStyling.FgCyan, `name: ${log.name}`);

      log.msg
        ? console.log(ANSIFontStyling.FgYellow, `message: ${log.msg}`)
        : "";

      log.isTrusted
        ? console.log(ANSIFontStyling.Reset, `isTrusted: ${log.isTrusted}`)
        : "";

      if (log.name === "router") {
        console.log(
          "\x1b[0m",
          `title: ${log.url?.state?.title}, url: ${log.url?.path}`
        );
      }

      log.mute !== undefined
        ? console.log(ANSIFontStyling.FgCyan, `mute: ${log.mute}`)
        : "";

      if (log?.name === "lighthouse") {
      }

      const sentMediaEvent =
        log?.name === "lighthouse" && log.payload ? log.payload : undefined;

      if (sentMediaEvent) {
        console.log(ANSIFontStyling.FgYellow, `type: ${sentMediaEvent.type}`);
        sentMediaEvent.at
          ? console.log(ANSIFontStyling.FgGreen, `at: ${sentMediaEvent.at}`)
          : "";
        console.log(
          ANSIFontStyling.FgGreen,
          `⬆ ${ANSIFontStyling.FgWhite}sent`
        );
      }

      const receiveLighthouseEvent =
        log?.name === "lighthouse" && log.event ? log.event : undefined;

      if (receiveLighthouseEvent) {
        console.log(
          ANSIFontStyling.FgYellow,
          `type: ${receiveLighthouseEvent.type}`
        );
        console.log(
          ANSIFontStyling.FgRed,
          `⬇ ${ANSIFontStyling.FgWhite}received`
        );
        receiveLighthouseEvent.at
          ? console.log(
              ANSIFontStyling.FgGreen,
              `at: ${receiveLighthouseEvent.at}`
            )
          : "";

        if (receiveLighthouseEvent?.type === "media") {
          console.log(
            ANSIFontStyling.FgCyan,
            `audio: ${receiveLighthouseEvent.audio}`
          );
        }

        if (receiveLighthouseEvent?.type === "member") {
          console.log(
            ANSIFontStyling.FgCyan,
            `can: ${JSON.stringify(receiveLighthouseEvent.can)}`
          );
        }

        if (
          receiveLighthouseEvent?.at &&
          mediaEvents[receiveLighthouseEvent.callId]?.at
        ) {
          if (
            new Date(receiveLighthouseEvent.at).valueOf() <
            new Date(mediaEvents[receiveLighthouseEvent.callId].at).valueOf()
          ) {
            console.log(
              ANSIFontStyling.FgRed,
              `\t${ANSIFontStyling.Underscore}received out of order!${ANSIFontStyling.Reset} 🤪\n`,
              `\t${ANSIFontStyling.FgWhite}previous media event at ${
                ANSIFontStyling.FgGreen
              }${mediaEvents[receiveLighthouseEvent.callId]?.at} ${
                ANSIFontStyling.FgWhite
              }and the next at ${ANSIFontStyling.FgGreen}${
                receiveLighthouseEvent?.at
              }`
            );
          }
        }

        if (receiveLighthouseEvent.type === "media") {
          mediaEvents[receiveLighthouseEvent.callId] = receiveLighthouseEvent;
        }
      }

      console.log("");
    });
  });
});
