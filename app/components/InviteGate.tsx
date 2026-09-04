"use client";

import { ArrowRight, Compass, KeyRound, LoaderCircle, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";

export default function InviteGate() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!code.trim()) return setError("请输入测试码");
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: code.trim() }) });
      const result = await response.json() as { authorized?: boolean; error?: string };
      if (!response.ok || !result.authorized) throw new Error(result.error || "验证失败");
      window.location.reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "验证失败"); setBusy(false); }
  };

  return <main className="invite-gate">
    <div className="invite-orbit orbit-one" /><div className="invite-orbit orbit-two" />
    <section className="invite-card">
      <div className="invite-brand"><span><Compass size={22} /></span><div><small>LIFE ATLAS</small><strong>人生地图</strong></div></div>
      <div className="invite-copy"><span><LockKeyhole size={18} /></span><small>PRIVATE PREVIEW</small><h1>进入你的生命档案</h1><p>这是一个受保护的测试空间。请输入测试码，继续查看你的经历和未来计划。</p></div>
      <form onSubmit={submit}>
        <label htmlFor="invite-code">用户端测试码</label>
        <div className={error ? "invite-code-field error" : "invite-code-field"}><KeyRound size={17} /><input id="invite-code" value={code} onChange={event => setCode(event.target.value.toUpperCase())} placeholder="输入测试码" autoComplete="one-time-code" spellCheck={false} /><button disabled={busy} aria-label="验证测试码">{busy ? <LoaderCircle className="spin" size={18} /> : <ArrowRight size={18} />}</button></div>
        {error && <p className="invite-error">{error}</p>}
        <small>通过后将在这台设备上保持 7 天访问状态。</small>
      </form>
    </section>
    <footer>你的记录默认仅自己可见 · LIFE ATLAS</footer>
  </main>;
}
