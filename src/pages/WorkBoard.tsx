import { useState } from 'react';
import { PageHeading } from '../components/ui';
import { CaseCard, NewCase } from '../components/Operations';
import { useOperations } from '../hooks/useOperations';
import type { Team } from '../domain/operations';

export default function WorkBoard({ team }: { team: Team }) {
  const { state } = useOperations();
  const [filter, setFilter] = useState('全部');
  const cases = state.cases.filter(c => c.team === team && (filter === '全部' || c.stage === filter));
  return <>
    <PageHeading eyebrow={team === '選品組' ? 'CURATION IN PROGRESS' : 'VISUALS IN THE MAKING'} title={team === '選品組' ? '選品進度' : '視覺進度'} description={team === '選品組' ? '正在挑哪些款式，還差哪一步。' : '定期社群內容、好友引導，以及上架前穿搭素材。'} />
    <NewCase team={team} />
    <div className="section-toolbar"><div className="filter-tabs" aria-label="作業狀態">{['全部', '進行中', '待審批', '已退回', '已放行'].map(value => <button key={value} aria-pressed={filter === value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{value}</button>)}</div></div>
    {cases.length ? <div className="case-grid">{cases.map(item => <CaseCard key={item.id} item={item} />)}</div> : <div className="ops-empty">{filter === '全部' ? '尚無作業，建立後即可追蹤進度。' : `目前沒有${filter}的作業。`}</div>}
  </>;
}
