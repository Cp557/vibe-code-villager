import { useVillagerStore } from "../../stores/villagerStore";

export function ControlPanel() {
  const goToGold = useVillagerStore((state) => state.goToGold);
  const goToTree = useVillagerStore((state) => state.goToTree);
  const returnHome = useVillagerStore((state) => state.returnHome);
  const currentState = useVillagerStore((state) => state.state);

  const canGoToGold = currentState === "idle";
  const canGoToTree = currentState === "idle";
  const canReturn = currentState === "mining" || currentState === "chopping";

  // Format state for display (replace underscores with spaces)
  const displayState = currentState.replace(/_/g, " ");

  return (
    <div className="control-panel">
      <div className="state-indicator">State: {displayState}</div>
      <div className="button-group">
        <button onClick={goToGold} disabled={!canGoToGold}>
          Gold
        </button>
        <button onClick={goToTree} disabled={!canGoToTree}>
          Tree
        </button>
        <button onClick={returnHome} disabled={!canReturn}>
          Return
        </button>
      </div>
    </div>
  );
}
