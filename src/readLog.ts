const fs = require("fs");

const readLog = (logFile: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    fs.readFile(logFile, "utf8", (err, contents) => {
      if (err) {
        reject(err);
      }

      const split = contents.split(/\r?\n/);

      const result = split.map((line) => {
        return JSON.parse(line);
      });

      resolve(result);
    });
  });
};

const results = readLog(
  "/Users/shimiz/Documents/projects/log-reader/src/aquila-2021-05-20T12-30-31.659Z.log"
);

const filterPreset = [
  {
    type: "member",
    props: ["can"],
  },
  {
    type: "media",
    props: ["active", "mute"],
  },
  {
    type: "updateCall",
  },
  {
    props: ["mute"],
  },
];

results.then((r) => {
  const filtered = r
    .map((message) => {
      if (message.mute !== undefined) {
        return {
          [new Date(message.time).toTimeString()]: {
            ...message,
          },
        };
      }

      if (
        (message.event?.topic === "74241828-c783-4ab7-81da-d6e84ffdc79e" &&
          (message.event?.type === "member" ||
            message.event?.type === "updateCall")) ||
        (message.event?.type === "media" && message.event?.active === true)
      ) {
        return {
          [new Date(message.time).toTimeString()]: { ...message.event },
        };
      }
    })
    .filter(Boolean);

  console.log("🚀 ~ ", filtered);
});
