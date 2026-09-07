import { useState } from "react";
import { initialPosts, initialTasks, initialWorkflows } from "../data/mock";
import type { ExecutionPlan } from "../domain/workflows";

export function useCommandCenter() {
  const [tasks, setTasks] = useState(initialTasks);
  const [workflows, setWorkflows] = useState(initialWorkflows);
  const [posts, setPosts] = useState(initialPosts);
  const [saved, setSaved] = useState<string[]>([]);
  const [plans, setPlans] = useState<Record<string, ExecutionPlan>>({});
  const [logs, setLogs] = useState([
    "09:30:00  商品資料整理完成 · 128 筆模擬資料",
    "08:00:00  社群內容排程檢查完成 · 12 筆模擬資料",
  ]);
  return { tasks, setTasks, workflows, setWorkflows, posts, setPosts, saved, setSaved, plans, setPlans, logs, setLogs };
}
