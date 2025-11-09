export type TransparencyEvent =
  | {
      type: "prompt";
      timestamp: number;
      payload: unknown;
    }
  | {
      type: "response";
      timestamp: number;
      payload: unknown;
    }
  | {
      type: "error";
      timestamp: number;
      payload: string;
    };

export class TransparencySession {
  private events: TransparencyEvent[] = [];

  constructor(public readonly sessionId: string) {}

  logPrompt(payload: unknown): void {
    this.events.push({
      type: "prompt",
      timestamp: Date.now(),
      payload
    });
  }

  logResponse(payload: unknown): void {
    this.events.push({
      type: "response",
      timestamp: Date.now(),
      payload
    });
  }

  logError(error: unknown): void {
    this.events.push({
      type: "error",
      timestamp: Date.now(),
      payload: error instanceof Error ? error.message : String(error)
    });
  }

  snapshot(): TransparencyEvent[] {
    return [...this.events];
  }
}

export class TransparencyLedger {
  private sessions = new Map<string, TransparencySession>();

  get(sessionId: string): TransparencySession {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = new TransparencySession(sessionId);
      this.sessions.set(sessionId, session);
    }
    return session;
  }

  export(): Record<string, TransparencyEvent[]> {
    return Array.from(this.sessions.entries()).reduce<Record<string, TransparencyEvent[]>>(
      (acc, [sessionId, session]) => {
        acc[sessionId] = session.snapshot();
        return acc;
      },
      {}
    );
  }
}

