import assert from "node:assert/strict";
import test from "node:test";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
const accessCookie = "life_atlas_user_access=la_preview_b393cb846c60";

async function render(path = "/", headers = {}) {
  const { default: worker } = await import(`${workerUrl.href}?test=${Date.now()}`);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html", ...headers } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("renders the Life Atlas product shell", async () => {
  const response = await render("/", { cookie: accessCookie });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>人生地图 · Life Atlas<\/title>/);
  assert.match(html, /搜索城市或区县/);
  assert.match(html, /滚轮或双指放大地球/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Starter Project/);
});

test("requires a user preview code without an access session", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /用户端测试码/);
  assert.match(html, /进入你的生命档案/);
  assert.doesNotMatch(html, /搜索城市或区县/);
});

test("renders the local administrator console", async () => {
  const response = await render("/admin");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Life Atlas/);
  assert.match(html, /管理后台/);
  assert.match(html, /数据概览/);
});
