import { Route, Routes } from "react-router";

import { AppShell } from "./components/common/AppShell";
import { GraphExplorer } from "./pages/GraphExplorer";
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/graph/:entityId" element={<GraphExplorer />} />
      </Routes>
    </AppShell>
  );
}
