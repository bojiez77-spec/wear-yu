import { Link, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WorkBoard from './pages/WorkBoard';
import Approvals from './pages/Approvals';
import AuditPage from './pages/Audit';
import Programs from './pages/Programs';
import { useCommandCenter } from './hooks/useCommandCenter';
import { OperationsProvider } from './hooks/useOperations';

export default function App() {
  const { workflows, setWorkflows, plans, setPlans, logs, setLogs } = useCommandCenter();
  return <OperationsProvider><Routes><Route element={<Layout />}>
    <Route index element={<Dashboard />} />
    <Route path="sourcing" element={<WorkBoard key="sourcing" team="選品組" />} />
    <Route path="social" element={<WorkBoard key="social" team="視覺組" />} />
    <Route path="approvals" element={<Approvals />} />
    <Route path="audit" element={<AuditPage />} />
    <Route path="programs" element={<Programs workflows={workflows} setWorkflows={setWorkflows} plans={plans} setPlans={setPlans} logs={logs} setLogs={setLogs} />} />
    <Route path="*" element={<div className="ops-empty"><h1>找不到這個頁面</h1><Link className="gold-button" to="/">返回作業總覽</Link></div>} />
  </Route></Routes></OperationsProvider>;
}
