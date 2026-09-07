import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { emptyWorkspace, operationsReducer, type Operation, type Workspace } from '../domain/operations';

type Context = { state: Workspace; demo: boolean; toggleDemo: () => void; dispatch: (action: Operation) => void };
const OperationsContext = createContext<Context | null>(null);
export function OperationsProvider({ children }: { children: ReactNode }) {
  const [demo, setDemo] = useState(false);
  const [live, setLive] = useState<Workspace>(() => {
    try { const saved = JSON.parse(localStorage.getItem('wear-yu-operations-v2') || 'null');
      return saved && ['batches', 'cases', 'decisions', 'audits'].every(k => Array.isArray(saved[k])) ? saved : emptyWorkspace();
    } catch { return emptyWorkspace(); }
  });
  const [storageError, setStorageError] = useState('');
  useEffect(() => { try { localStorage.setItem('wear-yu-operations-v2', JSON.stringify(live)); setStorageError(''); } catch { setStorageError('BLOCK：本機儲存失敗，請勿關閉頁面。'); } }, [live]);
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
  return <OperationsContext.Provider value={{ state: demo ? examples : live, demo, toggleDemo: () => setDemo(value => !value), dispatch }}><p className="work-auto-note">本機作業紀錄 · 尚未接通共用資料庫、身分驗證與外部發布服務</p>{storageError && <p role="alert">{storageError}</p>}{children}</OperationsContext.Provider>;
}
export function useOperations() {
  const value = useContext(OperationsContext);
  if (!value) throw new Error('OperationsProvider is required');
  return value;
}
