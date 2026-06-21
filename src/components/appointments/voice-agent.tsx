"use client";

import { AlertCircle, Mic2, PhoneOff } from "lucide-react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useAuth } from "@/lib/auth-context";

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

export function VoiceAgent() {
  if (!AGENT_ID) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-warning/50 bg-warning-subtle/40 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-warning" />
        <div>
          <p className="font-medium text-foreground">Voice agent not configured</p>
          <p className="text-sm text-muted-foreground mt-1">
            Set the{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
              NEXT_PUBLIC_ELEVENLABS_AGENT_ID
            </code>{" "}
            environment variable to enable voice booking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ConversationProvider agentId={AGENT_ID}>
      <VoiceAgentSession />
    </ConversationProvider>
  );
}

function VoiceAgentSession() {
  const { patient } = useAuth();
  const { status, message, isSpeaking, startSession, endSession } = useConversation();

  const connected = status === "connected";
  const connecting = status === "connecting";
  const hasError = status === "error";

  function handleStart() {
    startSession({
      dynamicVariables: { patient_id: patient?.id ?? "" },
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* How it works */}
      <div className="rounded-xl bg-primary-subtle border border-primary/20 p-4 flex gap-3">
        <Mic2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-foreground">
          <p className="font-medium mb-1">How it works</p>
          <p className="text-muted-foreground leading-relaxed">
            Click <strong className="text-foreground">Start booking</strong> below and speak
            naturally. Just say your <strong className="text-foreground">name</strong>, the{" "}
            <strong className="text-foreground">date</strong> and{" "}
            <strong className="text-foreground">time</strong> you&apos;d like, and the{" "}
            <strong className="text-foreground">type of appointment</strong> — our AI assistant
            will handle the rest.
          </p>
          <p className="text-muted-foreground mt-2 text-xs">
            Example: &ldquo;I&apos;m Jane Smith, I&apos;d like a general check-up on Tuesday the
            25th at 10am.&rdquo;
          </p>
        </div>
      </div>

      {/* Inline call UI */}
      <div className="flex flex-col items-center gap-4 py-8">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full border-2 transition-colors ${
            connected
              ? isSpeaking
                ? "border-accent bg-accent-subtle"
                : "border-primary bg-primary-subtle animate-pulse"
              : "border-border bg-muted"
          }`}
        >
          <Mic2 className={`h-8 w-8 ${connected ? "text-primary" : "text-muted-foreground"}`} />
        </div>

        <p className="text-sm font-medium text-foreground">
          {hasError
            ? "Something went wrong"
            : connecting
              ? "Connecting…"
              : connected
                ? isSpeaking
                  ? "Speaking…"
                  : "Listening…"
                : "Ready to start"}
        </p>

        {hasError && message && (
          <p className="text-xs text-destructive text-center max-w-sm">{message}</p>
        )}

        {connected ? (
          <button
            onClick={() => endSession()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[10px] bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <PhoneOff className="h-4 w-4" />
            End call
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={connecting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[10px] bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            <Mic2 className="h-4 w-4" />
            {connecting ? "Connecting…" : "Start booking"}
          </button>
        )}
      </div>
    </div>
  );
}
