import { useState } from "react";
import { CheckCircle2, Code2, Pause, Play, Terminal } from "lucide-react";
import { Badge, PageHeading } from "../components/ui";
import type { Workflow } from "../data/mock";

export default function Programs({
  workflows,
  setWorkflows,
  logs,
  setLogs,
}: {
  workflows: Workflow[];
  setWorkflows: React.Dispatch<React.SetStateAction<Workflow[]>>;
  logs: string[];
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [message, setMessage] = useState("");
  function run(workflow: Workflow) {
    const time = new Date().toLocaleTimeString("zh-TW", { hour12: false });
    setWorkflows((current) =>
      current.map((item) =>
        item.id === workflow.id ? { ...item, lastRun: `本次 ${time}` } : item,
      ),
    );
    setLogs((current) =>
      [
        `${time}  ${workflow.name}完成 · ${workflow.records} 筆模擬資料`,
        ...current,
      ].slice(0, 8),
    );
    setMessage(`${workflow.name}：模擬執行完成。`);
  }
  return (
    <>
      <PageHeading
        eyebrow="SYSTEMS THAT WORK FOR YOU"
        title="程式管理"
        description="讓日常工作有序執行，把時間留給更重要的事。"
        action={
          <Badge tone="green">
            <span className="live-dot" />
            工作流程就緒
          </Badge>
        }
      />
      <div className="info-strip">
        <Code2 size={17} />
        <span>展示工作流程與執行紀錄；所有執行均使用模擬資料。</span>
      </div>
      <div className="section-toolbar">
        <h2>
          工作流程 <small>Workflows</small>
        </h2>
        <span className="subtle">
          {workflows.filter((item) => item.status === "ready").length} 個啟用中
          / {workflows.length} 個流程
        </span>
      </div>
      <div className="workflow-list">
        {workflows.map((workflow) => (
          <article className="panel workflow" key={workflow.id}>
            <span className="workflow-icon">
              <Terminal size={23} />
            </span>
            <div className="workflow-description">
              <div className="workflow-title">
                <h2>{workflow.name}</h2>
                <Badge tone={workflow.status === "ready" ? "green" : "muted"}>
                  {workflow.status === "ready" ? "已啟用" : "已暫停"}
                </Badge>
              </div>
              <p className="subtle">{workflow.description}</p>
              <small>
                最近執行 {workflow.lastRun} <span>·</span> {workflow.records}{" "}
                筆資料
              </small>
            </div>
            <div className="workflow-actions">
              <button
                className="quiet-button"
                onClick={() =>
                  setWorkflows((current) =>
                    current.map((item) =>
                      item.id === workflow.id
                        ? {
                            ...item,
                            status:
                              item.status === "ready" ? "paused" : "ready",
                          }
                        : item,
                    ),
                  )
                }
              >
                {workflow.status === "ready" ? (
                  <Pause size={14} />
                ) : (
                  <Play size={14} />
                )}
                {workflow.status === "ready" ? "暫停" : "啟用"}
              </button>
              <button
                className="gold-button"
                disabled={workflow.status === "paused"}
                onClick={() => run(workflow)}
              >
                <Play size={14} />
                模擬執行
              </button>
            </div>
          </article>
        ))}
      </div>
      <section className="panel log-panel">
        <div className="panel-heading">
          <h2>
            執行紀錄 <small>Activity log</small>
          </h2>
          <Terminal size={16} />
        </div>
        <div className="log-lines">
          {logs.map((log, index) => (
            <div key={`${index}-${log}`}>
              <CheckCircle2 size={15} />
              <code>{log}</code>
              <Badge tone="green">成功</Badge>
            </div>
          ))}
        </div>
      </section>
      <p className="notice" role="status">
        {message}
      </p>
    </>
  );
}
