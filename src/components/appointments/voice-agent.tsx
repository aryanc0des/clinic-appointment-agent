"use client";

import React, { useEffect, useRef, useState } from "react";
import { Mic2, AlertCircle, Loader2 } from "lucide-react";

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

export function VoiceAgent() {
  const [scriptState, setScriptState] = useState<"loading" | "ready" | "error">("loading");
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!AGENT_ID) {
      setScriptState("error");
      return;
    }

    if (document.querySelector('script[src*="elevenlabs"]')) {
      setScriptState("ready");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://elevenlabs.io/convai-widget/index.js";
    script.async = true;
    script.onload = () => setScriptState("ready");
    script.onerror = () => setScriptState("error");
    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      scriptRef.current = null;
    };
  }, []);

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
    <div className="flex flex-col gap-5">
      {/* How it works */}
      <div className="rounded-xl bg-primary-subtle border border-primary/20 p-4 flex gap-3">
        <Mic2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-foreground">
          <p className="font-medium mb-1">How it works</p>
          <p className="text-muted-foreground leading-relaxed">
            Click the chat bubble in the bottom-right corner and speak naturally. Just say your{" "}
            <strong className="text-foreground">name</strong>, the{" "}
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

      {/* Widget status — the actual widget renders as a floating bubble, not inline here */}
      <div className="flex flex-col items-center gap-3 text-center py-6">
        {scriptState === "loading" && (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm">Loading voice assistant…</p>
          </div>
        )}

        {scriptState === "error" && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-destructive/40 bg-destructive-subtle/30 p-6 text-center w-full">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <div>
              <p className="font-medium text-foreground">Voice assistant unavailable</p>
              <p className="text-sm text-muted-foreground mt-1">
                Could not load the voice widget. Please try the manual booking form instead.
              </p>
            </div>
          </div>
        )}

        {scriptState === "ready" && (
          <>
            <Mic2 className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Ready — use the chat bubble in the bottom-right corner to start.
            </p>
            {React.createElement("elevenlabs-convai", {
              "agent-id": AGENT_ID,
              variant: "expanded",
              "avatar-orb-color-1": "#2D6A5F",
              "avatar-orb-color-2": "#C4622D",
              "action-text": "Talk to SmileCare",
              "start-call-text": "Start booking",
              "end-call-text": "End call",
            })}
          </>
        )}
      </div>
    </div>
  );
}
