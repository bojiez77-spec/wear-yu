import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from '../App';

function setup(path = '/') {
  render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
  return userEvent.setup();
}
describe('operations command center', () => {
  it('starts empty without fabricated business metrics and isolates examples from work', async () => {
    const user = setup();
    expect(screen.getByText('目前沒有作業或審批紀錄。')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/營業額|新增顧客|86,420|328,640|營收趨勢|訂單數量/);
    await user.click(screen.getByRole('button', { name: '查看示範' }));
    expect(screen.getByText('1 件上呈，等待你的核決。')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '退出示範' }));
    expect(screen.getByText('目前沒有作業或審批紀錄。')).toBeInTheDocument();
  });
  it('creates work, completes steps, submits and approves with shared progress', async () => {
    const user = setup('/sourcing');
    await user.click(screen.getByRole('button', { name: '新增作業' }));
    await user.type(screen.getByLabelText('作業名稱'), '棉麻襯衫');
    await user.click(screen.getByRole('button', { name: '建立' }));
    const card = screen.getByRole('heading', { name: '棉麻襯衫' }).closest('article')!;
    expect(within(card).getByRole('button', { name: '上呈 GM' })).toBeDisabled();
    for (const label of ['挑選款式', '確認樣品', '搭配評估']) await user.click(within(card).getByRole('checkbox', { name: label }));
    await user.click(within(card).getByRole('button', { name: '上呈 GM' }));
    await user.click(screen.getByRole('link', { name: '審批 Approvals' }));
    const approval = screen.getByRole('heading', { name: '棉麻襯衫' }).closest('article')!;
    await user.click(within(approval).getByRole('button', { name: '放行' }));
    expect(screen.getByRole('status')).toHaveTextContent('已放行');
    expect(screen.getByText('目前沒有等待核決的案件。')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: '選品 Sourcing' }));
    expect(screen.getByText('GM 已放行')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '查看示範' }));
    await user.click(screen.getByRole('button', { name: '退出示範' }));
    expect(screen.getByRole('heading', { name: '棉麻襯衫' })).toBeInTheDocument();
  });
  it('requires a return reason and shows it to the originating team', async () => {
    const user = setup('/approvals');
    await user.click(screen.getByRole('button', { name: '查看示範' }));
    const card = screen.getByRole('heading', { name: '霧藍襯衫 × 直筒長褲' }).closest('article')!;
    await user.click(within(card).getByRole('button', { name: '退回' }));
    expect(screen.getByRole('button', { name: '確認退回' })).toBeDisabled();
    await user.type(screen.getByLabelText('退回原因'), '補齊樣品尺寸');
    await user.click(screen.getByRole('button', { name: '確認退回' }));
    await user.click(screen.getByRole('link', { name: '選品 Sourcing' }));
    expect(screen.getByText('GM 退回：補齊樣品尺寸')).toBeInTheDocument();
  });
  it('blocks resubmission for open audit findings and allows it after correction', async () => {
    const user = setup('/social');
    await user.click(screen.getByRole('button', { name: '查看示範' }));
    expect(screen.getByRole('button', { name: '重新上呈' })).toBeDisabled();
    await user.click(screen.getByRole('link', { name: '稽核 Audit' }));
    await user.click(screen.getByRole('button', { name: '確認已改善' }));
    expect(screen.getByText('已改善')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: '視覺 Visual' }));
    await user.click(screen.getByRole('button', { name: '重新上呈' }));
    await user.click(screen.getByRole('link', { name: '審批 Approvals' }));
    expect(screen.getByRole('heading', { name: '秋日通勤穿搭短片' })).toBeInTheDocument();
  });
  it('records a clean audit without creating an unresolved finding', async () => {
    const user = setup('/audit');
    await user.click(screen.getByRole('button', { name: '查看示範' }));
    await user.click(screen.getByRole('button', { name: '新增查核' }));
    await user.click(screen.getByRole('button', { name: '記錄查核' }));
    expect(screen.getByText('本次查核未發現缺失。')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '確認已改善' })).toHaveLength(1);
  });
  it('restores focus and background scrolling after closing mobile navigation', async () => {
    const user = setup();
    const menu = screen.getByRole('button', { name: '開啟選單' });
    await user.click(menu);
    expect(document.body.style.overflow).toBe('hidden');
    await user.keyboard('{Escape}');
    expect(menu).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });
});
