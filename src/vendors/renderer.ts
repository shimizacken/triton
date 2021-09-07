import * as readline from "readline";
import { readLog } from "../core/readLog.js";
import { ANSIFontStyling } from "../enums.js";
import { Log, State } from "../types.js";
import { toTime } from "../utils/utils.js";

const consoleReader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const initRenderer =
  (log: Log) =>
  (state = { preset: "show all (enter)" } as State) => {
    log(
      `${ANSIFontStyling.BgMagenta}\n Welcome to ]pexip[ log parser ${ANSIFontStyling.Reset}\n`
    );

    consoleReader.question(` Path to log file? `, (input) => {
      state.path = input;
      log("");

      consoleReader.question(
        ` Filter by (can combine with '|')? 'show all' (enter) | 'mute' | 'media' | 'token': `,
        (_preset) => {
          const value = state.path?.toString().trim();

          const results = readLog(`${value}`);

          results.then((result) => {
            const mediaEvents = {};

            const topicId = result?.find(
              (obj) => obj?.type === "member"
            )?.topic;

            const topicLogs = result
              .filter((message) => {
                if (message?.topic && message?.topic !== topicId) {
                  return undefined;
                }

                return message;
              })
              .filter(Boolean);

            log(
              `${ANSIFontStyling.FgYellow}${ANSIFontStyling.Underscore}Log summary:${ANSIFontStyling.Reset}\n`
            );

            if (!topicId) {
              // TODO: fetch meeting URL
            }

            log(`${ANSIFontStyling.FgCyan} topic: ${topicId}\n`);

            const names = topicLogs
              .map((obj) => {
                if (obj.name) {
                  return obj.name;
                }
              })
              .filter(Boolean);

            log(
              ANSIFontStyling.FgYellow,
              `${ANSIFontStyling.Underscore}Logs from:${ANSIFontStyling.Reset}`
            );

            new Set(names).forEach((name) =>
              log(`${ANSIFontStyling.FgCyan} ${name}`)
            );

            const lighthouseEvents = topicLogs
              .map((obj) => {
                if (obj?.type) {
                  return obj.type;
                }
              })
              .filter(Boolean);

            log(ANSIFontStyling.Reset);

            log(
              ANSIFontStyling.FgYellow,
              `${ANSIFontStyling.Underscore}lighthouse events:${ANSIFontStyling.Reset}`
            );

            log(
              ANSIFontStyling.FgCyan,
              Array.from(new Set(lighthouseEvents)).join(", ")
            );

            log(ANSIFontStyling.Reset);

            log(
              ANSIFontStyling.FgYellow,
              `${ANSIFontStyling.Underscore}Log:${ANSIFontStyling.Reset}\n`
            );

            topicLogs.forEach((obj) => {
              log(ANSIFontStyling.FgGreen, `${obj.time} | ${toTime(obj.time)}`);
              log(ANSIFontStyling.FgCyan, `name: ${obj.name}`);

              obj.msg
                ? log(ANSIFontStyling.FgYellow, `message: ${obj.msg}`)
                : "";

              obj.isTrusted
                ? log(ANSIFontStyling.Reset, `isTrusted: ${obj.isTrusted}`)
                : "";

              if (obj.name === "router") {
                log(
                  "\x1b[0m",
                  `title: ${obj.url?.state?.title}, url: ${obj.url?.path}`
                );
              }

              if (obj.name === "media-processor") {
                obj.mute !== undefined
                  ? log(ANSIFontStyling.FgCyan, `mute: ${obj.mute}`)
                  : "";
                obj.shouldMute !== undefined
                  ? log(ANSIFontStyling.FgCyan, `shouldMute: ${obj.shouldMute}`)
                  : "";
                obj.gain !== undefined
                  ? log(ANSIFontStyling.FgCyan, `gain: ${obj.gain}`)
                  : "";
                obj.state
                  ? log(ANSIFontStyling.FgCyan, `state: ${obj.state}`)
                  : "";
              }

              if (obj?.name === "lighthouse") {
              }

              const sentMediaEvent =
                obj?.name === "lighthouse" ? obj : undefined;

              if (sentMediaEvent) {
                log(ANSIFontStyling.FgYellow, `type: ${sentMediaEvent.type}`);
                sentMediaEvent.at
                  ? log(ANSIFontStyling.FgGreen, `at: ${sentMediaEvent.at}`)
                  : "";
                log(
                  ANSIFontStyling.FgGreen,
                  `⬆ ${ANSIFontStyling.FgWhite}sent`
                );
              }

              const receiveLighthouseEvent =
                obj?.name === "lighthouse" ? obj : undefined;

              if (receiveLighthouseEvent) {
                log(
                  ANSIFontStyling.FgYellow,
                  `type: ${receiveLighthouseEvent.type}`
                );
                log(
                  ANSIFontStyling.FgRed,
                  `⬇ ${ANSIFontStyling.FgWhite}received`
                );
                receiveLighthouseEvent.at
                  ? log(
                      ANSIFontStyling.FgGreen,
                      `at: ${receiveLighthouseEvent.at}`
                    )
                  : "";

                if (receiveLighthouseEvent?.type === "media") {
                  log(
                    ANSIFontStyling.FgCyan,
                    `audio: ${receiveLighthouseEvent.audio}`
                  );
                  log(
                    ANSIFontStyling.FgCyan,
                    `actor: ${receiveLighthouseEvent.actor}`
                  );
                  log(
                    ANSIFontStyling.FgCyan,
                    `identity: ${receiveLighthouseEvent.identity}`
                  );
                }

                if (receiveLighthouseEvent?.type === "member") {
                  log(
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
                    new Date(
                      mediaEvents[receiveLighthouseEvent.callId].at
                    ).valueOf()
                  ) {
                    log(
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
                    log(
                      ANSIFontStyling.FgCyan,
                      `\taudio: ${
                        mediaEvents[receiveLighthouseEvent.callId]?.audio
                      }`
                    );
                    log(
                      ANSIFontStyling.FgCyan,
                      `\tactor: ${
                        mediaEvents[receiveLighthouseEvent.callId]?.actor
                      }`
                    );
                    log(
                      ANSIFontStyling.FgCyan,
                      `\tidentity: ${
                        mediaEvents[receiveLighthouseEvent.callId]?.identity
                      }`
                    );
                  }
                }

                if (receiveLighthouseEvent.type === "media") {
                  mediaEvents[receiveLighthouseEvent.callId] =
                    receiveLighthouseEvent;
                }
              }

              log(ANSIFontStyling.Reset);
            });

            consoleReader.question(`Exit (x) | Export (e): `, (input) => {
              if (input?.toString() === "e") {
                // TODO: export content to file.
              }

              if (input?.toString() === "x") {
                consoleReader.close();
              }
            });

            consoleReader.on("close", () => {
              log("👋");
              process.exit(0);
            });
          });
        }
      );
    });
  };
