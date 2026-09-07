import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../App";

function setup(path = "/") {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
  return userEvent.setup();
}
describe("Wear-Yu MVP flows", () => {
  it("restores navigation focus and background scrolling when closing the current page", async () => {
    const user = setup();
    const menu = screen.getByRole("button", { name: "開啟選單" });
    await user.click(menu);
    expect(document.body.style.overflow).toBe("hidden");
    await user.click(screen.getByRole("link", { name: "總覽 Dashboard" }));
    expect(menu).toHaveFocus();
    expect(menu).toHaveAttribute("aria-expanded", "false");
    expect(document.body.style.overflow).toBe("");
    await user.click(menu);
    await user.keyboard("{Escape}");
    expect(menu).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });
  it("recovers from combined empty sourcing filters without losing bookmarks", async () => {
    const user = setup("/sourcing");
    await user.click(screen.getByRole("button", { name: "收藏霧藍落肩襯衫" }));
    await user.click(screen.getByRole("button", { name: /收藏清單/ }));
    await user.click(screen.getByRole("button", { name: "配件" }));
    await user.type(screen.getByRole("searchbox"), "不存在");
    await user.click(screen.getByRole("button", { name: "清除篩選，瀏覽全部商品" }));
    expect(screen.getAllByRole("article")).toHaveLength(4);
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(screen.getByRole("button", { name: "取消收藏霧藍落肩襯衫" })).toHaveAttribute("aria-pressed", "true");
  });
  it("changes reporting period and preserves completed tasks across navigation", async () => {
    const user = setup();
    expect(screen.getAllByText("NT$ 86,420")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "本月" }));
    expect(screen.getAllByText("NT$ 328,640")).toHaveLength(2);
    await user.click(screen.getByRole("checkbox", { name: /確認秋季新品/ }));
    expect(screen.getByText("2 / 4")).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "程式 Programs" }));
    await user.click(screen.getByRole("link", { name: "總覽 Dashboard" }));
    expect(
      screen.getByRole("checkbox", { name: /確認秋季新品/ }),
    ).toBeChecked();
  });
  it("pauses, enables and runs a mock workflow with a visible log", async () => {
    const user = setup("/programs");
    const card = screen
      .getByRole("heading", { name: "選品週報彙整" })
      .closest("article")!;
    expect(
      within(card).getByRole("button", { name: "模擬執行" }),
    ).toBeDisabled();
    await user.click(within(card).getByRole("button", { name: "啟用" }));
    await user.click(within(card).getByRole("button", { name: "模擬執行" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "選品週報彙整：模擬執行完成",
    );
    expect(
      screen.getByText(/選品週報彙整完成 · 24 筆模擬資料/),
    ).toBeInTheDocument();
    await user.click(within(card).getByRole("button", { name: "暫停" }));
    expect(
      within(card).getByRole("button", { name: "模擬執行" }),
    ).toBeDisabled();
  });
  it("moves social drafts through review and scheduling with an empty filter state", async () => {
    const user = setup("/social");
    await user.click(screen.getByRole("button", { name: "草稿" }));
    await user.click(screen.getByRole("button", { name: "送出審核" }));
    expect(screen.getByText("目前沒有「草稿」內容。")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "待審核" }));
    const card = screen
      .getByRole("heading", { name: "你最在意一件襯衫的哪個細節？" })
      .closest("article")!;
    await user.click(within(card).getByRole("button", { name: "核准排程" }));
    await user.click(screen.getByRole("button", { name: "已排程" }));
    expect(
      screen.getByRole("heading", { name: "你最在意一件襯衫的哪個細節？" }),
    ).toBeInTheDocument();
  });
  it("searches, filters, sorts and preserves sourcing bookmarks", async () => {
    const user = setup("/sourcing");
    await user.type(screen.getByRole("searchbox"), "不存在");
    expect(screen.getByText(/沒有符合條件的商品/)).toBeInTheDocument();
    await user.clear(screen.getByRole("searchbox"));
    await user.selectOptions(screen.getByRole("combobox"), "price");
    expect(screen.getAllByRole("article")[0]).toHaveTextContent("霧藍落肩襯衫");
    await user.click(screen.getByRole("button", { name: "收藏霧藍落肩襯衫" }));
    await user.click(screen.getByRole("button", { name: /收藏清單/ }));
    expect(screen.getAllByRole("article")).toHaveLength(1);
    await user.click(screen.getByRole("link", { name: "總覽 Dashboard" }));
    await user.click(screen.getByRole("link", { name: "選品 Sourcing" }));
    expect(
      screen.getByRole("button", { name: "取消收藏霧藍落肩襯衫" }),
    ).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "配件" }));
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(
      screen.getByRole("heading", { name: "極簡肩背包" }),
    ).toBeInTheDocument();
  });
  it("offers a route home for unknown locations", () => {
    setup("/missing");
    expect(
      screen.getByRole("heading", { name: "找不到這個頁面" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回營運總覽" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
