import fs from "fs";

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

stdin.addListener("data", function (d) {
  // note:  d is an object, and when converted to a string it will
  // end with a linefeed.  so we (rather crudely) account for that
  // with toString() and then trim()

  const arg = d.toString().trim();

  // console.log(`you entered: ${arg}`);

  // /Users/shimiz/Documents/projects/log-reader/src/logs/pexip-2021-05-25T06-23-49.542Z.log

  const results = readLog(`${arg}`);

  results.then((r) => {
    r.filter((message) => {
      if (
        message.event?.topic &&
        message.event?.topic !== "6b3dd8e4-9c11-43d9-89dd-bb592b92f093"
      ) {
        return undefined;
      }

      return message;
    })
      .filter(Boolean)
      .forEach((t) => {
        console.log("\x1b[33m", `${t.time} | ${toTime(t.time)}`);
        console.log("\x1b[36m", `Name: ${t.name}`);
        t.msg ? console.log("\x1b[0m", `Message: ${t.msg}`) : "";
        t.isTrusted ? console.log("\x1b[0m", `isTrusted: ${t.isTrusted}`) : "";
        t.name === "router"
          ? console.log(
              "\x1b[0m",
              `Title: ${t.url.state.title}, Url: ${t.url.path}`
            )
          : "";
        console.log(
          "\x1b[0m",
          t.mute !== undefined ? ` Mute: ${t.mute}` : "",
          t.event?.type ? `\nType: ${t.event.type}\n` : "",
          t.event?.type === "media" ? `Audio: ${t.event.audio}` : "",
          t.payload?.type === "member"
            ? `Can ${JSON.stringify(t.payload.can)}`
            : ""
        );
      });
  });
});
