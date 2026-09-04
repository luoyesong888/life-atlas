import { ensureDatabase } from "@/db/bootstrap";

type GoalInput = {
  id?: string;
  title?: string;
  description?: string;
  why?: string;
  nextStep?: string;
  targetDate?: string;
  startDate?: string;
  domain?: string;
  timeMode?: string;
  nodeType?: string;
  status?: string;
  progress?: number;
  trackId?: string | null;
  linkedEntryId?: string | null;
  locationName?: string;
  prerequisiteId?: string | null;
};

const domains = new Set(["career", "relationship", "health", "creation", "wealth", "exploration"]);
const nodeTypes = new Set(["goal", "milestone", "turning", "habit"]);
const timeModes = new Set(["point", "range"]);
const statuses = new Set(["planned", "active", "complete", "paused"]);
const selectGoals = `SELECT id,title,description,why,next_step AS nextStep,target_date AS targetDate,
  start_date AS startDate,domain,time_mode AS timeMode,node_type AS nodeType,status,progress,track_id AS trackId,
  linked_entry_id AS linkedEntryId,location_name AS locationName,created_at AS createdAt FROM life_goals`;
const selectEdges = `SELECT id,from_goal_id AS fromGoalId,to_goal_id AS toGoalId,relation,created_at AS createdAt FROM life_goal_edges`;

function validate(body: GoalInput) {
  if (!body.title?.trim() || !body.targetDate || !body.startDate) return "请填写目标名称和时间";
  if (!Number.isFinite(new Date(body.targetDate).getTime()) || !Number.isFinite(new Date(body.startDate).getTime()) || body.startDate > body.targetDate) return "目标时间范围无效";
  if (!domains.has(body.domain || "")) return "人生领域无效";
  if (body.timeMode !== undefined && !timeModes.has(body.timeMode)) return "年龄目标形式无效";
  if (!nodeTypes.has(body.nodeType || "")) return "节点类型无效";
  if (!statuses.has(body.status || "")) return "目标状态无效";
  const progress = Number(body.progress || 0);
  if (!Number.isFinite(progress) || progress < 0 || progress > 100) return "进度必须在 0—100 之间";
  return null;
}

export async function GET() {
  try {
    const db = await ensureDatabase();
    const [goalResult, edgeResult] = await Promise.all([
      db.prepare(`${selectGoals} ORDER BY target_date, created_at`).all(),
      db.prepare(`${selectEdges} ORDER BY created_at`).all(),
    ]);
    return Response.json({ goals: goalResult.results || [], edges: edgeResult.results || [] });
  } catch (cause) {
    return Response.json({ error: cause instanceof Error ? cause.message : "人生目标暂时无法读取" }, { status: 500 });
  }
}

async function replacePrerequisite(db: D1Database, goalId: string, prerequisiteId: string | null | undefined) {
  if (prerequisiteId === undefined) return;
  await db.prepare("DELETE FROM life_goal_edges WHERE to_goal_id=? AND relation='depends'").bind(goalId).run();
  if (!prerequisiteId || prerequisiteId === goalId) return;
  const exists = await db.prepare("SELECT id FROM life_goals WHERE id=?").bind(prerequisiteId).first();
  if (!exists) return;
  await db.prepare("INSERT INTO life_goal_edges (id,from_goal_id,to_goal_id,relation,created_at) VALUES (?,?,?,?,?)")
    .bind(crypto.randomUUID(), prerequisiteId, goalId, "depends", new Date().toISOString()).run();
}

export async function POST(request: Request) {
  const body = await request.json() as GoalInput;
  const error = validate(body);
  if (error) return Response.json({ error }, { status: 400 });
  const db = await ensureDatabase();
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO life_goals
    (id,title,description,why,next_step,target_date,start_date,domain,time_mode,node_type,status,progress,track_id,linked_entry_id,location_name,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(id, body.title!.trim(), body.description || "", body.why || "", body.nextStep || "", body.targetDate, body.startDate, body.domain, body.timeMode || "point", body.nodeType, body.status, Number(body.progress || 0), body.trackId || null, body.linkedEntryId || null, body.locationName || "", new Date().toISOString()).run();
  await replacePrerequisite(db, id, body.prerequisiteId);
  return Response.json({ goal: await db.prepare(`${selectGoals} WHERE id=?`).bind(id).first() }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json() as GoalInput;
  if (!body.id) return Response.json({ error: "缺少目标 ID" }, { status: 400 });
  const error = validate(body);
  if (error) return Response.json({ error }, { status: 400 });
  const db = await ensureDatabase();
  await db.prepare(`UPDATE life_goals SET title=?,description=?,why=?,next_step=?,target_date=?,start_date=?,domain=?,time_mode=?,node_type=?,status=?,progress=?,track_id=?,linked_entry_id=?,location_name=? WHERE id=?`)
    .bind(body.title!.trim(), body.description || "", body.why || "", body.nextStep || "", body.targetDate, body.startDate, body.domain, body.timeMode || "point", body.nodeType, body.status, Number(body.progress || 0), body.trackId || null, body.linkedEntryId || null, body.locationName || "", body.id).run();
  await replacePrerequisite(db, body.id, body.prerequisiteId);
  return Response.json({ goal: await db.prepare(`${selectGoals} WHERE id=?`).bind(body.id).first() });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "缺少目标 ID" }, { status: 400 });
  const db = await ensureDatabase();
  await db.batch([
    db.prepare("DELETE FROM life_goal_edges WHERE from_goal_id=? OR to_goal_id=?").bind(id, id),
    db.prepare("DELETE FROM life_goals WHERE id=?").bind(id),
  ]);
  return Response.json({ ok: true });
}
