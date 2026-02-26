import { useEffect, useRef } from "react";
import { useVillagerStore } from "../stores/villagerStore";

interface ClaudeEvent {
  event_type: string;
}

function isTauri(): boolean {
  return "__TAURI_INTERNALS__" in window;
}

export function useClaudeEvents() {
  // Seed the starting resource from the current hour so it varies each session
  const startWithGold = new Date().getHours() % 2 === 0;
  const lastResourceRef = useRef<"gold" | "tree">(startWithGold ? "tree" : "gold");
  const listenerSetUp = useRef(false);

  useEffect(() => {
    if (!isTauri() || listenerSetUp.current) return;
    listenerSetUp.current = true;

    const setup = async () => {
      const { listen } = await import("@tauri-apps/api/event");

      await listen<ClaudeEvent>("claude-event", (event) => {
        console.log("Received Claude event:", event.payload);

        // Read latest state directly from store (avoids stale closures)
        const state = useVillagerStore.getState();

        switch (event.payload.event_type) {
          case "prompt_submit":
            if (state.state === "idle") {
              if (lastResourceRef.current === "tree") {
                state.goToGold();
                lastResourceRef.current = "gold";
              } else {
                state.goToTree();
                lastResourceRef.current = "tree";
              }
            } else {
              // Villager is still out — queue the next task and send them home to drop off first
              const nextTask: "gold" | "tree" = lastResourceRef.current === "tree" ? "gold" : "tree";
              lastResourceRef.current = nextTask;
              state.queueTask(nextTask);
              state.returnHome();
            }
            break;

          case "stop":
          case "interrupt":
            if (
              state.state === "mining" ||
              state.state === "chopping" ||
              state.state === "walking_to_mine" ||
              state.state === "walking_to_tree"
            ) {
              state.returnHome();
            }
            break;
        }
      });
    };

    setup();
  }, []);
}
