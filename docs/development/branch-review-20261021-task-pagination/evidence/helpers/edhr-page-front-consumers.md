# 前端待办/已办消费溯源（只读）

固定提交：`13def47d4def51237d1393eaa7bf2651e98a0cbd`；仓库：`/workspace/edhr-nexus-frontend`。

At the fixed source commit, the declared dashboard route reaches a direct /workflow/tasks/todo|done GET consumer with page=1,size=5 and array consumption. The same-named getTodo/getDone helper module is not the source path used by that route. Separate form/DHR review route consumers use page=0,size=20 and page-shaped content/totals. Source facts alone do not establish runtime response compatibility or a page defect.

本任务仅查阅固定 Git 源码。`wholeFileReviewComplete=false`、`runtimeExecuted=false`；未修改仓库、测试、配置或知识，未运行构建、浏览器或产品测试，未作页面缺陷断言。

| 声明路由 | 请求 | 初始 page / size | 消费数据形状 |
| --- | --- | --- | --- |
| `/` 首页待办/已办 | `GET /api/v1/workflow/tasks/todo` 或 `/done` | `1 / 5`；size 为请求显式常量 | `res.data.data` 按 `Task[]`；无 content/totals |
| `/form-management/review` | `GET /api/v1/form-worklists/REVIEW_PENDING` 或 `/REVIEW_DONE` | `0 / 20`；size 为 UI 初始状态 | `FormWorklistPage.content` 和 totals |
| `/dhr-management/review` | `GET /api/v1/dhr-reviews?view=PENDING\|DONE` | `0 / 20`；size 为 UI 初始状态 | `content` 和 totals |

`api/workflow-tasks.ts` 的 `getTodo/getDone` 都指向 `/workflow/tasks`，但首页使用直接 client 调用。固定提交 `frontend/src` 全域符号与模块文本搜索仅得到这两个 helper 的定义，未发现对该模块或这两个符号的引用。此结论限定为静态文本引用证据。

## 源码映射（均为已读有限行段）

- **FRONT-BOOTSTRAP-HTML** `gmp-platform/frontend/index.html`，method=`HTML module entry`，range=`9-12` / 实际 13 行。
  - blob=`af1bf78ec2ae0249d5159d9c80468b4c8c98a57d`；SHA-256=`2ec49ded6e8aee045427d3ee9912032b71ab00511516bbacf3e914fe32073add`；readDepth=`bounded-source-trace`；wholeFileReviewComplete=false；runtimeExecuted=false。
  - HTML module entry loads /src/main.tsx into #root.
- **FRONT-BOOTSTRAP-MAIN** `gmp-platform/frontend/src/main.tsx`，method=`ReactDOM.createRoot/render`，range=`1-10` / 实际 10 行。
  - blob=`9aa52ffd1f3c20df29c8074ce111522fd1cb4897`；SHA-256=`2ed12a1457cd60b31c0f44f3ea59b8bbc2ddd4a49add3165228d093878fb7c24`；readDepth=`bounded-source-trace`；wholeFileReviewComplete=false；runtimeExecuted=false。
  - main imports and renders App. This is source reachability only; no application was run.
- **FRONT-BOOTSTRAP-APP** `gmp-platform/frontend/src/App.tsx`，method=`App/BrowserRouter/AppRouter`，range=`1-9, 242-259` / 实际 259 行。
  - blob=`1e38757ae726ffaef00732636b583506ab38bae7`；SHA-256=`6f11b6185c5322dd7475ba14f0e07b5c610c9bbc2dea18d3e8d868c68add27a6`；readDepth=`bounded-source-trace`；wholeFileReviewComplete=false；runtimeExecuted=false。
  - App imports AppRouter and mounts it within BrowserRouter and QueryClientProvider.
- **FRONT-LAYOUT-OUTLET** `gmp-platform/frontend/src/components/shared/AppLayout.tsx`，method=`AppLayout/Outlet`，range=`1-4, 1414-1425` / 实际 1425 行。
  - blob=`35b91453659bdc8e517d1d54c8f7bf7eead1da73`；SHA-256=`61289d0cb45f772a2604840430764c42ead20060fe8a5c1d263572645719ca88`；readDepth=`bounded-source-trace`；wholeFileReviewComplete=false；runtimeExecuted=false。
  - The protected layout renders Outlet, providing the source path to nested routes.
- **FRONT-ACTIVE-ROUTES** `gmp-platform/frontend/src/router/index.tsx`，method=`AppRouter route declarations`，range=`9-33, 61-116` / 实际 158 行。
  - blob=`12c81470b76a5ecb2ee2e16dc48603033f36d522`；SHA-256=`8eaf4ff1ad44ce421f4fc68727a168f4f27cbef854e1c5a5eed9c955c13b06b3`；readDepth=`bounded-source-trace`；wholeFileReviewComplete=false；runtimeExecuted=false。
  - The protected / index renders DashboardPage; /workflow/tasks/:id renders TaskDetail; /form-management/review renders FormReviewPage; /dhr-management/review renders DhrReviewPage. This establishes declared source routing, not browser execution.
- **FRONT-DASHBOARD-TABS** `gmp-platform/frontend/src/pages/dashboard/DashboardPage.tsx`，method=`DashboardPage`，range=`1-9, 18-25, 60-69` / 实际 86 行。
  - blob=`4beaccb334e0cf414280606cc39190f884b20994`；SHA-256=`bffdf8309fac299eaed8059a6250f264d14517dd80179865caf35b607d96765c`；readDepth=`bounded-source-trace`；wholeFileReviewComplete=false；runtimeExecuted=false。
  - Dashboard imports TodoList and DoneList and conditionally renders TodoList for tab 0 or DoneList otherwise; tab 0 is initial state.
- **FRONT-TODO-WRAPPER** `gmp-platform/frontend/src/pages/dashboard/TodoList.tsx`，method=`TodoList`，range=`1-7` / 实际 7 行。
  - blob=`e34e5df8d001978f1ec1c10c4a1e9ad72ec86012`；SHA-256=`a6559945182d2b7d1ff36246e2268f4cc8ddd65668237969961640b82334376e`；readDepth=`bounded-source-trace`；wholeFileReviewComplete=false；runtimeExecuted=false。
  - TodoList passes kind=todo and the current auth user id to DashboardTaskList.
- **FRONT-DONE-WRAPPER** `gmp-platform/frontend/src/pages/dashboard/DoneList.tsx`，method=`DoneList`，range=`1-7` / 实际 7 行。
  - blob=`7f281f030e23d9d258656f4b32a0f900f1dca11a`；SHA-256=`fd5384b7502acc6207b236479489b155784d072e0b163de5ba29dda4ae3f6850`；readDepth=`bounded-source-trace`；wholeFileReviewComplete=false；runtimeExecuted=false。
  - DoneList passes kind=done and the current auth user id to DashboardTaskList.
- **FRONT-DASHBOARD-CONSUMER** `gmp-platform/frontend/src/pages/dashboard/DashboardTaskList.tsx`，method=`DashboardTaskList / HTTP GET`，range=`1-9, 11-22, 27-39, 47-61` / 实际 63 行。
  - blob=`c9bdac66955f4d37b6408a7d5eb6a55b470eb68d`；SHA-256=`20c917457870ac7ba620937bde4ec01b0e3e1d1d27a4a5015b79706d750ab100`；readDepth=`bounded-source-trace`；wholeFileReviewComplete=false；runtimeExecuted=false。
  - The routed dashboard consumer calls client.get(/workflow/tasks/ + kind), yielding GET /api/v1/workflow/tasks/todo or /api/v1/workflow/tasks/done. It sends page with initial value 1 and explicit size 5; it does not send assigneeId. The query is enabled only when assigneeId exists. It returns res.data.data as Task[], uses tasks.length and tasks.map, and does not read PageResult.content or totals. Previous/next decrement/increment page; next is disabled for tasks.length < 5. These are caller-side source facts only.
- **FRONT-CLIENT** `gmp-platform/frontend/src/api/client.ts`，method=`axios.create / response interceptor`，range=`14-20, 36-50, 66-66` / 实际 66 行。
  - blob=`4d67bf63a3ec49078ec7a6fe507cc84fa817c776`；SHA-256=`f5b919fc5059196d41adf259870c24dff3e9b930fdc98ba5846b10334c85ae75`；readDepth=`bounded-source-trace`；wholeFileReviewComplete=false；runtimeExecuted=false。
  - The client baseURL is /api/v1. The response interceptor checks body.code and returns the Axios response itself; the inspected interceptor does not flatten data, convert list/page shapes, or translate page indices.
- **FRONT-COMMON-SHAPES** `gmp-platform/frontend/src/types/common.ts`，method=`ApiResponse<T> / PageResult<T> / PageQuery`，range=`1-24` / 实际 36 行。
  - blob=`04e698a17cb9b5cead7454627effe7b35d69be76`；SHA-256=`f7aa611902bf635c8624749d23a0edbcf76e7f813efb31cd03fa65067453189c`；readDepth=`bounded-source-trace`；wholeFileReviewComplete=false；runtimeExecuted=false。
  - Common types distinguish ApiResponse.data from PageResult.content/page/size/totalElements/totalPages. DashboardTaskList consumes the former data as an array, not the latter page structure.
- **FRONT-HELPER-DEFINITIONS** `gmp-platform/frontend/src/api/workflow-tasks.ts`，method=`getTodo / getDone / helper module`，range=`1-9` / 实际 9 行。
  - blob=`ea9c0f63771e7bcfa2aa793b8b605e5dee265a6c`；SHA-256=`7aa5a6623a471ee264000f00d33c45aa3732798fb58523b9988fb6cc78bfeaae`；readDepth=`bounded-source-trace`；wholeFileReviewComplete=false；runtimeExecuted=false。
  - getTodo and getDone are exported helpers that both GET /workflow/tasks with optional pass-through params; they define neither a default page nor a default size. They are not imported by the traced dashboard chain. Fixed-commit textual symbol/module search over frontend/src found only the definitions of getTodo/getDone and no workflow-tasks module reference; this is bounded static reference evidence, not proof about dynamic runtime loading.
- **FRONT-FORM-REVIEW-CONSUMER** `gmp-platform/frontend/src/pages/form-management/FormReviewPage.tsx`，method=`FormReviewPage / listFormWorklist`，range=`19-22, 73-76, 121-130, 190-215, 226-231, 275-285` / 实际 374 行。
  - blob=`26076537400f1fc353aac8b588949c16732da489`；SHA-256=`3c1dbed9f84cf748349b1febbf23c60fdb79d27e25fa29321d41ea475f7cd581`；readDepth=`bounded-source-trace`；wholeFileReviewComplete=false；runtimeExecuted=false。
  - The separately routed form-review screen has My Todo/My Done views REVIEW_PENDING/REVIEW_DONE. It calls listFormWorklist(view,queryParams), starts page=0 and size=20, passes those values unchanged through toQuery, consumes query.data.content and totalElements/totalPages, and resets page to 0 when changing view or page size.
- **FRONT-FORM-WORKLIST-API** `gmp-platform/frontend/src/api/form-instance-records.ts`，method=`listFormWorklist / HTTP GET`，range=`79-82, 101-116, 124-135` / 实际 135 行。
  - blob=`7a3fcdbaa3c37ff16f6205f4c3cc0648734b70c9`；SHA-256=`6fcdaf7d6edd525e225da1373cf53ee3742f994fc338c7c7e7d9b227694637d2`；readDepth=`bounded-source-trace`；wholeFileReviewComplete=false；runtimeExecuted=false。
  - listFormWorklist GETs /api/v1/form-worklists/{encoded view}, so the reviewed screen uses /form-worklists/REVIEW_PENDING and /form-worklists/REVIEW_DONE. It serializes supplied query values with URLSearchParams and returns res.data.data as FormWorklistPage (content/page/size/totalElements/totalPages plus historyCoverage). The helper query default is {}, with no page/size value inserted by this helper.
- **FRONT-DHR-REVIEW-CONSUMER** `gmp-platform/frontend/src/pages/dhr-management/DhrReviewPage.tsx`，method=`DhrReviewPage / listDhrReviewTasks`，range=`1-18, 118-130` / 实际 130 行。
  - blob=`a9aa299bd0f515c6be943e5e92ce3173fdb7f1bb`；SHA-256=`651c4e34f0ddee5bc3db718e484d3cf1135352ca5974a16a2023370ad7f127d6`；readDepth=`bounded-source-trace`；wholeFileReviewComplete=false；runtimeExecuted=false。
  - The separately routed DHR review screen uses PENDING/DONE views (labels My Pending Review/My Reviewed), starts page=0 and size=20, calls listDhrReviewTasks({view,keyword,page,size}), and passes content/totals to DhrWorklistTable. This is a distinct endpoint family from workflow/tasks.
- **FRONT-DHR-WORKLIST-API** `gmp-platform/frontend/src/api/dhr-workbenches.ts`，method=`listDhrReviewTasks / HTTP GET`，range=`1-17` / 实际 34 行。
  - blob=`6e8008f72536f2b176b9c47e66df73cadaea10f6`；SHA-256=`8e37a7893860dd1b7383498f3771c97d6fbcaff97f58eb6a882c7c4f3b0040ee`；readDepth=`bounded-source-trace`；wholeFileReviewComplete=false；runtimeExecuted=false。
  - listDhrReviewTasks GETs /api/v1/dhr-reviews with view, keyword, page and size; its declared response is content plus totalElements/totalPages, not a bare task array. It supplies no additional default page/size.
- **FRONT-DHR-TABLE-PAGINATION** `gmp-platform/frontend/src/pages/dhr-management/DhrWorklistTable.tsx`，method=`DhrWorklistTable / FormListPagination`，range=`1-17, 33-46` / 实际 46 行。
  - blob=`dcd41acfa198acf0e41415b83e94f74b1df1fa41`；SHA-256=`0c2116a4085d2608234467a52313e96b910da8ded95f1beb5e47129ec2003332`；readDepth=`bounded-source-trace`；wholeFileReviewComplete=false；runtimeExecuted=false。
  - DhrWorklistTable renders rows and passes its page/size/totals through to the shared FormListPagination component.
- **FRONT-SHARED-ZERO-BASED-PAGINATION** `gmp-platform/frontend/src/pages/form-management/formManagementListStyles.tsx`，method=`FormListPagination`，range=`45-76` / 实际 76 行。
  - blob=`6c74625588d43258790b867d051b1002d88820aa`；SHA-256=`f97782404d82962523306180142a435587c2738c3426b09b802527a7423542e6`；readDepth=`bounded-source-trace`；wholeFileReviewComplete=false；runtimeExecuted=false。
  - The shared paginator presents page+1 to MUI Pagination and converts selected UI page back with value-1, so the inspected form/DHR review consumers maintain zero-based request page state. It does not alter the dashboard paginator.

JSON 包含完整证据 ID、范围、Git blob、SHA-256、固定提交、消费者摘要及 helper 引用搜索原始命中。后端默认值与返回实现由父任务另行核对，本报告不将前端期望写成服务端事实。
