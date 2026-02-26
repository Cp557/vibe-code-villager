import { GameCanvas } from "./components/GameCanvas";
// import { ControlPanel } from "./components/ui/ControlPanel";
// import { SetupPanel } from "./components/ui/SetupPanel";
import { useClaudeEvents } from "./hooks/useClaudeEvents";
import "./styles/index.css";

function App() {
  // Listen for Claude Code events and trigger villager actions
  useClaudeEvents();

  return (
    <div className="app-container">
      <GameCanvas />
      {/* <ControlPanel /> */}
      {/* <SetupPanel /> */}
    </div>
  );
}

export default App;
