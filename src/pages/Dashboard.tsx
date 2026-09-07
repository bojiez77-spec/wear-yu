import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, ClipboardCheck, Palette, ShoppingBag } from 'lucide-react';
import { useOperations } from '../hooks/useOperations';
import { progress } from '../domain/operations';
import { PageHeading } from '../components/ui';

export default function Dashboard() {
  const { state, demo, toggleDemo } = useOperations();
  const pending = state.cases.filter(c => c.stage === '待審批');
  const returned = state.cases.filter(c => c.stage === '已退回');
  const findings = state.audits.filter(a => a.finding && !a.resolved);
  return <>
    <PageHeading eyebrow="OPERATIONS AT A GLANCE" title="作業總覽" description="先看待處理，再看各組進度。" />
    {!state.cases.length ? <section className="ops-intro"><span className="eyebrow">READY WHEN YOU ARE</span><h2>從第一件作業開始。</h2><p>目前沒有作業或審批紀錄。</p><div className="action-row"><Link className="gold-button" to="/sourcing">建立選品作業</Link><button className="quiet-button" onClick={toggleDemo}>查看示範流程</button></div></section> : <section className="ops-intro compact-intro"><span className="eyebrow">{demo ? '示範工作台' : '本次工作台'}</span><h2>{pending.length ? `${pending.length} 件上呈，等待你的核決。` : '目前沒有等待核決的案件。'}</h2><Link className="text-link" to="/approvals">前往 GM 審批 <ArrowUpRight size={16} /></Link></section>}
    <div className="ops-counters">{[
      { name: '待審批', count: pending.length, to: '/approvals', icon: ClipboardCheck },
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
