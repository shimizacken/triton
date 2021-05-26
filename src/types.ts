export type LighthouseEvent = {
  name: string;
  payload?: { topic: string; type: string; at: string };
  event?: {
    topic: string;
    type: string;
    at: string;
    callId: string;
    can?: string;
    audio?: boolean;
  };
  time: number;
  msg?: string;
  isTrusted?: boolean;
  mute?: boolean;
  url?: { path?: string; state: { title?: string } };
};
