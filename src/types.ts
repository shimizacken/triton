export type LighthouseEventType = "media" | "member" | "stage" | "updateCall";

export type AppName =
  | "aquila"
  | "lighthouse"
  | "media-control"
  | "media-processor"
  | "media"
  | "router"
  | "service-auth"
  | "signal"
  | "media-control"
  | "media-processor"
  | "peer-connection"
  | "service-auth";

export type Filter = "mute" | "token";

export interface lighthouseEvent {
  topic: string;
  type: LighthouseEventType;
  at: string;
  callId: string;
  can?: string;
  audio?: boolean;
  actor?: string;
  identity?: string;
}

export interface LogEntryCore extends lighthouseEvent {
  name: AppName;
  time: number;
  msg?: string;
  isTrusted?: boolean;
  mute?: boolean;
  shouldMute?: boolean;
  gain?: number;
  state?: AudioContextState;
  url?: { path?: string; state: { title?: string } };
}

export type LogItem = {
  time: number;
  type: "lighthouse-event" | "info";
  appName: AppName;
  eventType?: LighthouseEventType;
  message: string;
  labels: string[];
};

export type Preset = "show all (enter)" | "mute" | "media" | "token";

export interface LoggerState {
  path: string;
  preset: Preset;
}

export type Log = (message?: any, ...optionalParams: any[]) => void;
