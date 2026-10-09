"use client";

import { Route, Routes } from "react-router";
import "./App.css";
import IndexPage from "../pages/index/ui";

function App() {
  return (
    <main>
      <header></header>
      <Routes>
        <Route index element={<IndexPage />} />
      </Routes>
      <footer></footer>
    </main>
  );
}

export default App;
