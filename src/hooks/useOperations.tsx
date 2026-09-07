import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { emptyWorkspace, operationsReducer, type Operation, type Workspace } from '../domain/operations';

type Context = { state: Workspace; demo: boolean; toggleDemo: () => void; dispatch: (action: Operation) => void };
const OperationsContext = createContext<Context | null>(null);
export function OperationsProvider({ children }: { children: ReactNode }) {
  const [demo, setDemo] = useState(false);
  const [live, setLive] = useState(emptyWorkspace);
  const [examples, setExamples] = useState(emptyWorkspace);
  useEffect(() => {
    if (!demo) return;
    const timer = window.setInterval(() => setExamples(current => {
      const batch = current.batches.find(b => b.status === '執行中' || b.status === 'GM 改善中');
      return batch ? operationsReducer(current, { type: 'advance', id: batch.id }) : current;
    }), 1800);
    return () => window.clearInterval(timer);
  }, [demo]);
  const dispatch = (action: Operation) => (demo ? setExamples : setLive)(state => operationsReducer(state, action));
  return <OperationsContext.Provider value={{ state: demo ? examples : live, demo, toggleDemo: () => setDemo(value => !value), dispatch }}>{children}</OperationsContext.Provider>;
}
export function useOperations() {
  const value = useContext(OperationsContext);
  if (!value) throw new Error('OperationsProvider is required');
  return value;
}
