import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from '../App';
function setup() { render(<MemoryRouter><App /></MemoryRouter>); return userEvent.setup(); }
describe('chairman batch interface', () => {
  it('launches a batch once and automatically creates department work without fabricated completion', async () => {
    const user = setup();
    expect(screen.getByRole('heading', { name: 'WEAR-YU｜品牌營運中心' })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/營業額|86,420|新增作業/);
    await user.click(screen.getByRole('button', { name: '發起新批次選品' }));
    expect(screen.getByRole('button', { name: '本批次處理中' })).toBeDisabled();
    expect(screen.getByText(/執行服務尚未接通/)).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: '選品 Sourcing' }));
    expect(screen.getByRole('heading', { name: '第 01 批次｜淘寶候選款式搜尋' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '新增作業' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: '視覺 Visual' }));
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: '第 01 批次｜上架前穿搭短影片' })).toBeInTheDocument();
  });
  it('keeps demo batches separate from actual queued batches', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: '發起新批次選品' }));
    await user.click(screen.getByRole('button', { name: '查看示範' }));
    expect(screen.getByRole('button', { name: '發起新批次選品' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: '退出示範' }));
    expect(screen.getByRole('button', { name: '本批次處理中' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: '董事長放行' })).not.toBeInTheDocument();
  });
  it('restores mobile navigation focus on Escape', async () => {
    const user = setup(); const menu = screen.getByRole('button', { name: '開啟選單' });
    await user.click(menu); expect(document.body.style.overflow).toBe('hidden');
    await user.keyboard('{Escape}'); expect(menu).toHaveFocus(); expect(document.body.style.overflow).toBe('');
  });
});
