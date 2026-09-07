import { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Programs from "./pages/Programs";
import Social from "./pages/Social";
import Sourcing from "./pages/Sourcing";
import { initialPosts, initialTasks, initialWorkflows } from "./data/mock";

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [workflows, setWorkflows] = useState(initialWorkflows);
  const [posts, setPosts] = useState(initialPosts);
  const [saved, setSaved] = useState<string[]>([]);
  const [logs, setLogs] = useState([
    "09:30:00  商品資料整理完成 · 128 筆模擬資料",
    "08:00:00  社群內容排程檢查完成 · 12 筆模擬資料",
  ]);
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          index
          element={
            <Dashboard
              tasks={tasks}
              toggleTask={(id) =>
                setTasks((current) =>
                  current.map((task) =>
                    task.id === id ? { ...task, done: !task.done } : task,
                  ),
                )
              }
            />
          }
        />
        <Route
          path="programs"
          element={
            <Programs
              workflows={workflows}
              setWorkflows={setWorkflows}
              logs={logs}
              setLogs={setLogs}
            />
          }
        />
        <Route
          path="social"
          element={<Social posts={posts} setPosts={setPosts} />}
        />
        <Route
          path="sourcing"
          element={
            <Sourcing
              saved={saved}
              toggleSaved={(id) =>
                setSaved((current) =>
                  current.includes(id)
                    ? current.filter((item) => item !== id)
                    : [...current, id],
                )
              }
            />
          }
        />
        <Route
          path="*"
          element={
            <div className="empty-state">
              <h1>找不到這個頁面</h1>
              <Link className="gold-button" to="/">
                返回營運總覽
              </Link>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
