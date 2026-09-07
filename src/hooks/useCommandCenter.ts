import { useState } from "react";
import { initialWorkflows } from "../data/mock";
import type { ExecutionPlan } from "../domain/workflows";

export function useCommandCenter() {
  const [workflows, setWorkflows] = useState(initialWorkflows);
  const [plans, setPlans] = useState<Record<string, ExecutionPlan>>({});
  const [logs, setLogs] = useState<string[]>([]);
  return { workflows, setWorkflows, plans, setPlans, logs, setLogs };
}
