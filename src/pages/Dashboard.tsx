import { BatchBrowser } from '../components/BatchBrowser';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, ClipboardCheck, Palette, ShoppingBag } from 'lucide-react';
import { useOperations } from '../hooks/useOperations';
import { StartBatch, BatchFlow, BatchDecision } from '../components/BatchFlow';
import { progress } from '../domain/operations';

export default function Dashboard() {
  const { state, demo, toggleDemo } = useOperations();
  const pending = state.batches.filter(b => b.status === '待 GM 審核');
  const returned = state.batches.filter(b => b.status === 'GM 改善中');
  const findings = state.audits.filter(a => a.finding && !a.resolved);
  const chairmanPending = state.batches.filter(b => b.status === '待董事長核決');
  const active = state.batches.filter(b => b.status !== '已放行');
  return <div className="brand-home">
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero-copy"><p className="eyebrow">THOUGHTFULLY CURATED. BEAUTIFULLY RUN.</p>
        <h1 id="home-title" aria-label="WEAR-YU｜品牌營運中心">WEAR-YU<span>品牌營運中心</span></h1>
        <p className="home-motto">以品味選物，<br />以細節成就日常。</p>
        <div className="home-launch"><StartBatch />{!demo && !state.batches.length && <button className="home-demo" onClick={toggleDemo}>體驗批次流程 <ArrowUpRight size={14} /></button>}</div>
      </div>
      <div className="home-signature" aria-hidden="true"><span>W<span>Y</span></span><small>CURATION / CREATION / EVERYDAY</small></div>
      <div className="home-hero-foot"><span>THE NEXT COLLECTION</span><span>{active.length ? '批次進行中' : '準備好，開始下一次選品。'}</span></div>
    </section>
    <div className="home-section-heading"><h2>此刻焦點</h2><span>{demo ? '示範資料' : '本次工作'}</span></div>
    <div className="ops-counters">{[
      { name: '待社群核決', count: chairmanPending.length, to: '/approvals', icon: ClipboardCheck },
      { name: '待 GM 審核', count: pending.length, to: '/approvals', icon: ClipboardCheck },
      { name: '退回改善', count: returned.length, to: '/approvals', icon: ArrowUpRight },
      { name: '稽核缺失', count: findings.length, to: '/audit', icon: CheckCircle2 },
    ].map(({ name, count, to, icon: Icon }) => to.startsWith('#') ? <button type="button" onClick={() => document.getElementById('current-batch')?.scrollIntoView({ block: 'start' })} key={name}><Icon size={18} /><span>{name}</span><strong>{count}</strong><ArrowUpRight size={15} /></button> : <Link to={to} key={name}><Icon size={18} /><span>{name}</span><strong>{count}</strong><ArrowUpRight size={15} /></Link>)}</div>
    <div id="current-batch" className="home-active-batch"><BatchBrowser key={`${demo}-${state.batches.at(-1)?.id}`} batches={state.batches}>{batch => <><BatchDecision batch={batch} actor="董事長" /><BatchFlow batch={batch} /></>}</BatchBrowser></div>
    <div className="home-section-heading"><h2>品牌工作室</h2><span>從選物，到視覺呈現</span></div>
    <div className="ops-overview-grid">{(['選品組', '視覺組'] as const).map(team => {
      const items = state.cases.filter(c => c.team === team);
      const Icon = team === '選品組' ? ShoppingBag : Palette;
      return <section className="ops-section" key={team}><div className="panel-heading"><h2><Icon size={18} />{team}</h2><Link to={team === '選品組' ? '/sourcing' : '/social'} className="text-link">查看 <ArrowUpRight size={14} /></Link></div>
        {items.length ? items.slice(-3).map(c => <Link className="progress-row" key={c.id} to={team === '選品組' ? '/sourcing' : '/social'}><div><strong>{c.title}</strong><small>{c.kind} · {c.stage}</small></div><progress value={progress(c)} max="100" aria-label={`${c.title}進度`} /><span>{progress(c)}%</span></Link>) : <div className="home-team-empty"><p>{team === '選品組' ? '發現值得留下的款式。' : '讓穿搭，成為想靠近的日常。'}</p><small>{team === '選品組' ? '淘寶選品 · 來源查核 · 搭配評估' : '品牌內容 · 穿搭短片 · 好友引導'}</small><span>等待新批次</span></div>}
      </section>;
    })}</div>
    <section className="ops-section"><div className="panel-heading"><h2>最近核決</h2><Link className="text-link" to="/approvals">全部紀錄 <ArrowUpRight size={14} /></Link></div>{state.decisions.length ? state.decisions.slice(0, 3).map(d => <div className="decision-row" key={d.id}><span className={`decision-result ${d.result === '放行' ? 'pass' : ''}`}>{d.result}</span><div><strong>{d.title}</strong><p>{d.reason || '已核准進入下一步'}</p></div><small>{d.time}</small></div>) : <p className="empty-copy">尚無 GM 核決紀錄</p>}</section>

  </div>;
}
