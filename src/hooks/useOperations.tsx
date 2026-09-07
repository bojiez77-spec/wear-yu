import { createContext, useContext, useState, type ReactNode } from 'react';
import { emptyWorkspace, exampleWorkspace, operationsReducer, type Operation, type Workspace } from '../domain/operations';

type Context = { state: Workspace; demo: boolean; toggleDemo: () => void; dispatch: (action: Operation) => void };
const OperationsContext = createContext<Context | null>(null);
export function OperationsProvider({ children }: { children: ReactNode }) {
  const [demo, setDemo] = useState(false);
  const [live, setLive] = useState(emptyWorkspace);
  const [examples, setExamples] = useState(exampleWorkspace);
  const dispatch = (action: Operation) => (demo ? setExamples : setLive)(state => operationsReducer(state, action));
  return <OperationsContext.Provider value={{ state: demo ? examples : live, demo, toggleDemo: () => setDemo(value => !value), dispatch }}>{children}</OperationsContext.Provider>;
}
export function useOperations() {
  const value = useContext(OperationsContext);
  if (!value) throw new Error('OperationsProvider is required');
  return value;
}
