export interface LogEntryCore {
  name: string;
  time: number;
  msg?: string;
  isTrusted?: boolean;
  mute?: boolean;
  url?: { path?: string; state: { title?: string } };
}

export interface lighthouseEvent {
  topic: string;
  type: string;
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
