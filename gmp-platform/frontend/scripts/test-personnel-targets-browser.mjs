import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { build } from "esbuild";

const { chromium } = await import(
  process.env.EDHR_PLAYWRIGHT_MODULE || "playwright"
);
const root = path.resolve(import.meta.dirname, "..");
const output = path.resolve(
  process.env.EDHR_PERSONNEL_OUTPUT || "../../output/personnel-targets-browser",
);
const temp = await mkdtemp(path.join(os.tmpdir(), "edhr-personnel-browser-"));
const results = [];
const people = Array.from({ length: 151 }, (_, n) => ({
  id: String(50000 + n),
  name: `人员${String(n).padStart(3, "0")}`,
  username: `user${n}`,
}));
let browser, server;
try {
  await mkdir(output, { recursive: true });
  await build({
    absWorkingDir: root,
    stdin: {
      resolveDir: root,
      loader: "tsx",
      contents: `
    import React, {useState} from 'react'; import {createRoot} from 'react-dom/client';
    import {MemoryRouter,Routes,Route} from 'react-router-dom';
    import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
    import {ThemeProvider,createTheme,CssBaseline} from '@mui/material';
    import Selector from './src/components/identity/PersonnelTargetSelect';
    import Responsibility from './src/components/workflow/WorkflowResponsibilityDialog';
    import Task from './src/pages/workflow-center/TaskDetail';
    import {SnackbarProvider} from './src/components/SnackbarProvider';
    import {getResponsibilityTargets} from './src/api/workflow-operations';
    import {getExecutionTransferTargets as getExecution} from './src/api/production-execution';
    import './src/index.css';
    const surface=window.__fixture.surface; const client=new QueryClient({defaultOptions:{queries:{retry:false}}});
    function App(){const [person,setPerson]=useState(null);const [task,setTask]=useState('10');const [done,setDone]=useState(false);
      if(surface==='task')return <Task/>;
      if(surface==='responsibility')return done?<div role="status">已完成</div>:<Responsibility taskId="10" taskState="unchanged-state" reassign onClose={()=>setDone(true)} onSuccess={()=>setDone(true)}/>;
      const load=(page,keyword,signal)=>surface==='form-review'||surface==='production'?getExecution('109','op','form',surface,keyword,page,signal):getResponsibilityTargets(task,true,keyword,page,signal);
      return <div style={{maxWidth:560,margin:'32px auto',padding:16}}><Selector key={task} scope={[surface,task]} loadPage={load} value={person} onChange={p=>{setPerson(p);window.__selected=p;}}/><button onClick={()=>{setPerson(null);setTask('11');}}>切换任务</button></div>;
    }
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme({palette:{primary:{main:'#1890ff'}}})}><CssBaseline/><QueryClientProvider client={client}><SnackbarProvider><MemoryRouter initialEntries={['/workflow/tasks/10']}><Routes><Route path="/workflow/tasks/:id" element={<App/>}/></Routes></MemoryRouter></SnackbarProvider></QueryClientProvider></ThemeProvider>);
  `,
    },
    bundle: true,
    platform: "browser",
    format: "esm",
    outfile: path.join(temp, "bundle.js"),
    alias: { "@": path.join(root, "src") },
    loader: {
      ".css": "css",
      ".woff2": "file",
      ".ttf": "file",
      ".svg": "dataurl",
    },
    define: { "process.env.NODE_ENV": '"development"' },
  });
  await writeFile(
    path.join(temp, "index.html"),
    '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/bundle.css"><div id="root"></div><script type="module" src="/bundle.js"></script></html>',
  );
  server = http.createServer(async (request, response) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    const base = pathname === "/" ? "index.html" : path.basename(pathname);
    const file = path.join(temp, base);
    try {
      const body = await readFile(file);
      response.setHeader(
        "Content-Type",
        base.endsWith(".js")
          ? "text/javascript"
          : base.endsWith(".css")
            ? "text/css"
            : "text/html; charset=utf-8",
      );
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH,
    headless: true,
  });
  async function run(
    name,
    surface,
    check,
    fixture = {},
    viewport = { width: 1280, height: 900 },
  ) {
    const context = await browser.newContext({ viewport });
    const requests = [],
      writes = [],
      errors = [];
    await context.addInitScript(
      (f) => {
        window.__fixture = f;
        localStorage.setItem("token", "isolated-test-token");
      },
      { surface, ...fixture },
    );
    let failed = false;
    await context.route("**/api/v1/**", async (route) => {
      const request = route.request(),
        url = new URL(request.url());
      if (request.method() !== "GET") {
        writes.push({ path: url.pathname, body: request.postDataJSON() });
        await route.fulfill({ json: { code: 200, data: {} } });
        return;
      }
      if (url.pathname.endsWith("transfer-context")) {
        await route.fulfill({
          json: {
            code: 200,
            data: {
              taskState: "unchanged-state",
              signatureRequired: false,
              canTransfer: true,
            },
          },
        });
        return;
      }
      const page = Number(url.searchParams.get("page"));
      const size = Number(url.searchParams.get("size"));
      const keyword = url.searchParams.get("keyword") || "";
      assert.equal(size, 50);
      assert.ok(page >= 1);
      requests.push({
        path: url.pathname,
        page,
        keyword,
        copy: url.searchParams.get("instanceId"),
      });
      if (fixture.failPage === page && !failed) {
        failed = true;
        await route.fulfill({
          status: 500,
          json: { code: 500, message: "隔离模拟失败" },
        });
        return;
      }
      if (keyword === "slow")
        await new Promise((resolve) => setTimeout(resolve, 600));
      const matching =
        keyword === "slow"
          ? [{ id: "slow", name: "旧请求", username: "slow" }]
          : keyword === "fast"
            ? [{ id: "fast", name: "新请求", username: "fast" }]
            : people.filter((p) => `${p.name} ${p.username}`.includes(keyword));
      await route
        .fulfill({
          json: {
            code: 200,
            data: {
              content: matching.slice((page - 1) * size, page * size),
              page,
              size,
              hasNext: page * size < matching.length,
            },
          },
        })
        .catch(() => {});
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}/`);
      await check(page, requests, writes);
      assert.deepEqual(errors, []);
      results.push({ name, result: "passed", requests, writes });
    } catch (error) {
      await page.screenshot({
        path: path.join(output, `${name}-failed.png`),
        fullPage: true,
      });
      results.push({
        name,
        result: "failed",
        message: error.message,
        requests,
        writes,
        errors,
      });
      throw error;
    } finally {
      await context.close();
    }
  }
  const loaded = (page, n) =>
    page
      .getByRole("status")
      .filter({ hasText: `已加载 ${n} 人` })
      .waitFor();
  const more = (page) =>
    page.getByRole("button", { name: "加载更多人员", exact: true }).click();
  await run("all-pages-and-keyboard", "selector", async (page) => {
    await loaded(page, 50);
    await more(page);
    await loaded(page, 100);
    await more(page);
    await loaded(page, 150);
    const input = page.getByRole("combobox");
    await input.focus();
    await input.press("ArrowDown");
    const trigger = await page.locator(".MuiAutocomplete-root").boundingBox();
    const popup = await page.locator(".MuiAutocomplete-popper").boundingBox();
    assert.ok(Math.abs(trigger.width - popup.width) <= 1);
    await page.screenshot({ path: path.join(output, "desktop-popup.png") });
    await page
      .getByRole("option", { name: "人员112（user112）", exact: true })
      .click();
    assert.equal(await page.evaluate(() => window.__selected.id), "50112");
    await more(page);
    await loaded(page, 151);
    await page
      .getByText("已加载 151 人，已全部加载", { exact: true })
      .waitFor();
    assert.equal(
      await page
        .getByRole("button", { name: "加载更多人员", exact: true })
        .count(),
      0,
    );
    await input.focus();
    await input.press("ArrowDown");
    await input.press("ArrowDown");
    await input.press("Escape");
    assert.equal(await page.getByRole("listbox").count(), 0);
  });
  await run(
    "ime-search-clear-and-empty",
    "selector",
    async (page, requests) => {
      await loaded(page, 50);
      const input = page.getByRole("combobox");
      await input.dispatchEvent("compositionstart");
      await input.fill("不存在");
      await input.press("Enter");
      await page.waitForTimeout(400);
      assert.ok(!requests.some((r) => r.keyword === "不存在"));
      await input.dispatchEvent("compositionend");
      await page
        .getByText("已加载 0 人，已全部加载", { exact: true })
        .waitFor();
      await input.focus();
      await input.press("ArrowDown");
      await page.getByText("暂无符合条件的人员", { exact: true }).waitFor();
      await page
        .getByRole("button", { name: "清除人员搜索", exact: true })
        .click();
      await loaded(page, 50);
      assert.equal(await input.inputValue(), "");
    },
  );
  await run(
    "stale-search-and-scope-reset",
    "selector",
    async (page, requests) => {
      await loaded(page, 50);
      const input = page.getByRole("combobox");
      await input.fill("slow");
      await page.waitForFunction(
        () => document.activeElement?.getAttribute("role") === "combobox",
      );
      await page.waitForTimeout(330);
      await input.fill("fast");
      await page.getByRole("option", { name: "新请求（fast）" }).waitFor();
      await page.waitForTimeout(650);
      assert.equal(
        await page.getByRole("option", { name: "旧请求（slow）" }).count(),
        0,
      );
      await input.press("Escape");
      await page.getByRole("button", { name: "切换任务" }).click();
      await loaded(page, 50);
      assert.equal(await page.getByRole("combobox").inputValue(), "");
      assert.ok(
        requests.some(
          (r) => r.path.includes("/11/") && r.page === 1 && !r.keyword,
        ),
      );
    },
  );
  await run("keyboard-commits-a-later-person", "selector", async (page) => {
    await loaded(page, 50);
    const input = page.getByRole("combobox");
    await input.fill("user150");
    await page
      .getByRole("option", { name: "人员150（user150）", exact: true })
      .waitFor();
    await input.press("ArrowDown");
    await input.press("Enter");
    assert.equal(await page.evaluate(() => window.__selected.id), "50150");
  });
  for (const failPage of [1, 2])
    await run(
      `page-${failPage}-failure-retry`,
      "selector",
      async (page) => {
        if (failPage === 2) {
          await loaded(page, 50);
          await more(page);
        }
        await page.getByRole("alert").filter({ hasText: "加载失败" }).waitFor();
        await page.getByRole("button", { name: "重试", exact: true }).click();
        await loaded(page, failPage * 50);
      },
      { failPage },
    );
  for (const surface of ["form-review", "production"])
    await run(`${surface}-api-adapter`, surface, async (page, requests) => {
      await loaded(page, 50);
      await more(page);
      await loaded(page, 100);
      await more(page);
      await loaded(page, 150);
      await page
        .getByRole("option", { name: "人员112（user112）", exact: true })
        .click();
      assert.equal(await page.evaluate(() => window.__selected.id), "50112");
      assert.ok(
        requests.every(
          (r) =>
            r.path.includes("/production/execution/109/transfer-targets") &&
            r.copy === surface,
        ),
      );
    });
  await run(
    "task-page-transfer-beyond-100",
    "task",
    async (page, requests, writes) => {
      await page.getByRole("button", { name: "转办", exact: true }).click();
      await loaded(page, 50);
      await more(page);
      await loaded(page, 100);
      await more(page);
      await loaded(page, 150);
      await page
        .getByRole("option", { name: "人员112（user112）", exact: true })
        .click();
      await page.getByLabel("转办原因").fill("隔离验证后续页目标");
      await page.getByRole("button", { name: "确认转办", exact: true }).click();
      await page.getByText("转办成功", { exact: true }).waitFor();
      assert.equal(writes[0].body.newAssigneeId, "50112");
      assert.ok(
        requests.every(
          (r) => r.path === "/api/v1/workflow/tasks/10/transfer-targets",
        ),
      );
    },
  );
  await run(
    "responsibility-dialog-beyond-100",
    "responsibility",
    async (page) => {
      await loaded(page, 50);
      await more(page);
      await loaded(page, 100);
      await more(page);
      await loaded(page, 150);
      await page
        .getByRole("option", { name: "人员112（user112）", exact: true })
        .click();
      assert.equal(
        await page.getByRole("combobox").inputValue(),
        "人员112（user112）",
      );
    },
  );
  await run(
    "narrow-popup-and-keyboard-load",
    "selector",
    async (page) => {
      await loaded(page, 50);
      const input = page.getByRole("combobox");
      await input.focus();
      await input.press("Tab");
      await page
        .getByRole("button", { name: "加载更多人员", exact: true })
        .focus();
      await page.keyboard.press("Enter");
      await loaded(page, 100);
      await input.focus();
      await input.press("ArrowDown");
      await page.screenshot({ path: path.join(output, "narrow-popup.png") });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      const popup = await page.locator(".MuiAutocomplete-popper").boundingBox();
      assert.ok(popup.x >= 0 && popup.x + popup.width <= 391);
    },
    {},
    { width: 390, height: 844 },
  );
  await writeFile(
    path.join(output, "result.json"),
    JSON.stringify(
      {
        result: "passed",
        scope:
          "Actual shared selector/API adapters, task page and responsibility dialog in Chromium with isolated HTTP fixtures; not native API authorization or real signature verification",
        cases: results,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({ result: "passed", cases: results.length, output }),
  );
} catch (error) {
  await writeFile(
    path.join(output, "result.json"),
    JSON.stringify(
      { result: "failed", message: error.message, cases: results },
      null,
      2,
    ),
  );
  throw error;
} finally {
  await browser?.close();
  if (server) await new Promise((resolve) => server.close(resolve));
  await rm(temp, { recursive: true, force: true });
}
