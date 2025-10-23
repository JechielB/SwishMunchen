import MainScreen from "./pages/MainScreen";
import SignUp from "./pages/SignUp";
import Leaderboard from "./pages/Leaderboard";
import ModeSelect from "./pages/ModeSelect";
import PigIntro from "./pages/PigIntro";
import PigGame from "./pages/PigGame";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PracticeGame from "./pages/PracticeGame";
import PracticeIntro from "./pages/PracticeIntro";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/main" element={<MainScreen />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/modes" element={<ModeSelect />} />
        <Route path="/pig" element={<PigIntro />} />
        <Route path="/pig/play" element={<PigGame />} />
        <Route path="/practice" element={<PracticeIntro />} />
        <Route path="/practice/play" element={<PracticeGame />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
