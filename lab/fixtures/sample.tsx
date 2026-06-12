import { useEffect, useState, type ReactNode } from 'react';
import { AgentBadge } from './AgentBadge';
import { fetchAgents, type Agent } from './api';

const POLL_MS = 30_000;

export interface PanelProps {
  title: string;
  limit?: number;
  children?: ReactNode;
}

export function AgentPanel({ title, limit = 5, children }: PanelProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function poll() {
      const next = await fetchAgents({ limit });
      if (alive) setAgents(next.filter((a) => a.active));
    }
    poll().finally(() => setLoading(false));
    const timer = setInterval(poll, POLL_MS);
    return () => { alive = false; clearInterval(timer); };
  }, [limit]);

  if (loading) return <p className="muted">Loading {title}…</p>;

  return (
    <section className="panel" data-count={agents.length}>
      <h2>{title}</h2>
      <ul>
        {agents.map((agent) => (
          <li key={agent.id}>
            <AgentBadge name={agent.name} tone={agent.errors > 0 ? 'warn' : 'ok'} />
            <span className="meta">{`${agent.calls} calls / ${agent.uptime}%`}</span>
          </li>
        ))}
      </ul>
      {children}
    </section>
  );
}
