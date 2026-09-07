import { PageHeading } from '../components/ui';
import { BatchDecision } from '../components/BatchFlow';
import { useOperations } from '../hooks/useOperations';

export default function Approvals() {
  const { state } = useOperations();
  const pending = state.batches.filter(b => b.status === '待 GM 審核');
  return <><PageHeading eyebrow="GENERAL MANAGER" title="GM 最終審核" description="各組與必要控制完成後，由 GM 最終審核並上呈董事長。" />
    {pending.map(batch => <BatchDecision key={batch.id} batch={batch} actor="GM" />)}
    {!pending.length && <div className="ops-empty">尚無成熟批次；一般補件與退回由 GM 工作佇列處理。</div>}
    <div className="section-toolbar"><h2>核決紀錄</h2></div><section className="ops-section">{state.decisions.map(d => <div className="decision-row" key={d.id}><span className={`decision-result ${d.result === '放行' ? 'pass' : ''}`}>{d.result}</span><div><strong>{d.title}</strong><p>{d.reason || '已核准進入下一步'}</p></div><small>{d.time}</small></div>)}{!state.decisions.length && <p className="empty-copy">尚無核決紀錄</p>}</section>
  </>;
}
