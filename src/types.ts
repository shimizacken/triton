export type AppName =
  | "aquila"
  | "lighthouse"
  | "media-control"
  | "media-processor"
  | "media"
  | "router"
  | "service-auth"
  | "signal";

export type LighthouseEventType = "media" | "member" | "stage" | "updateCall";

export type Filter = "mute" | "token";

export interface LogEntryCore {
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

export interface lighthouseEvent {
  topic: string;
  type: LighthouseEventType;
  at: string;
  callId: string;
  can?: string;
  audio?: boolean;
}

export interface LogEntry extends LogEntryCore {
  payload?: lighthouseEvent;
  event?: lighthouseEvent;
}

export interface State {
  path: string;
}

export type Log = (message?: any, ...optionalParams: any[]) => void;
