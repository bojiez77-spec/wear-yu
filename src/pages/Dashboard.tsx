import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, ClipboardCheck, Palette, ShoppingBag } from 'lucide-react';
import { useOperations } from '../hooks/useOperations';
import { StartBatch, BatchFlow, BatchDecision } from '../components/BatchFlow';
import { progress } from '../domain/operations';
import { PageHeading } from '../components/ui';

export default function Dashboard() {
  const { state, demo, toggleDemo } = useOperations();
  const pending = state.batches.filter(b => b.status === '待 GM 審核');
  const returned = state.batches.filter(b => b.status === 'GM 改善中');
  const findings = state.audits.filter(a => a.finding && !a.resolved);
  return <>
    <PageHeading eyebrow="OPERATIONS AT A GLANCE" title="董事長工作台" description="發起批次，掌握進度，成熟後核決。" />
    <section className="ops-intro compact-intro"><span className="eyebrow">CHAIRMAN COMMAND</span><h2>一次下令，各組依序接手。</h2><StartBatch />{!demo && !state.batches.length && <button className="text-link" onClick={toggleDemo}>先查看制度演練 <ArrowUpRight size={14} /></button>}</section>
    {!state.batches.length && <p className="empty-copy">尚未發起批次，不需人工新增選品或視覺作業。</p>}
    {state.batches.slice().reverse().map(batch => <div key={batch.id}><BatchFlow batch={batch} /><BatchDecision batch={batch} actor="董事長" /></div>)}
    <div className="ops-counters">{[
      { name: '待 GM 審核', count: pending.length, to: '/approvals', icon: ClipboardCheck },
      { name: '退回改善', count: returned.length, to: '/approvals', icon: ArrowUpRight },
      { name: '稽核缺失', count: findings.length, to: '/audit', icon: CheckCircle2 },
    ].map(({ name, count, to, icon: Icon }) => <Link to={to} key={name}><Icon size={18} /><span>{name}</span><strong>{count}</strong><ArrowUpRight size={15} /></Link>)}</div>
    <div className="ops-overview-grid">{(['選品組', '視覺組'] as const).map(team => {
      const items = state.cases.filter(c => c.team === team);
      const Icon = team === '選品組' ? ShoppingBag : Palette;
      return <section className="ops-section" key={team}><div className="panel-heading"><h2><Icon size={18} />{team}</h2><Link to={team === '選品組' ? '/sourcing' : '/social'} className="text-link">查看 <ArrowUpRight size={14} /></Link></div>
        {items.length ? items.map(c => <Link className="progress-row" key={c.id} to={team === '選品組' ? '/sourcing' : '/social'}><div><strong>{c.title}</strong><small>{c.kind} · {c.stage}</small></div><progress value={progress(c)} max="100" aria-label={`${c.title}進度`} /><span>{progress(c)}%</span></Link>) : <p className="empty-copy">尚無作業</p>}
      </section>;
    })}</div>
    <section className="ops-section"><div className="panel-heading"><h2>最近核決</h2><Link className="text-link" to="/approvals">全部紀錄 <ArrowUpRight size={14} /></Link></div>{state.decisions.length ? state.decisions.slice(0, 3).map(d => <div className="decision-row" key={d.id}><span className={`decision-result ${d.result === '放行' ? 'pass' : ''}`}>{d.result}</span><div><strong>{d.title}</strong><p>{d.reason || '已核准進入下一步'}</p></div><small>{d.time}</small></div>) : <p className="empty-copy">尚無 GM 核決紀錄</p>}</section>
  </>;
}
