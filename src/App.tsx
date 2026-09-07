import { Link, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Programs from "./pages/Programs";
import Social from "./pages/Social";
import Sourcing from "./pages/Sourcing";
import { useCommandCenter } from "./hooks/useCommandCenter";

export default function App() {
  const { tasks, setTasks, workflows, setWorkflows, posts, setPosts, saved, setSaved, plans, setPlans, logs, setLogs } = useCommandCenter();
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
              plans={plans}
              setPlans={setPlans}
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
