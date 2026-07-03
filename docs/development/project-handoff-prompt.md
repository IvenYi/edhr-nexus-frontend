# Zencas eDHR 项目交接提示词

> 生成日期：2026-06-26
> 适用仓库：`/Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案`
> 主工程目录：`gmp-platform`
> 当前分支：`edhr-dev`

## 1. 交接提示词

你正在接手 Zencas eDHR 商业级可定制平台项目。请先读取本文件，再按当前仓库真实状态继续开发。不要凭历史对话或单个文件判断项目进度，必须先执行 `git status --short --branch --untracked-files=all`、读取相关规范文档和目标页面源码。

本项目当前重点是后台工作台标准化、系统管理、组织管理、安全审计、工艺建模、模板建模和表单模板导入/设计器能力。用户偏好是直接推进、中文沟通、每次开发后做 QA 验证；涉及 UI 页面时需要尽量按既有标准复用，不要随意新增风格或重构无关文件。

优先原则：

- 只改当前任务必须改的文件，避免顺手重构。
- 前端页面必须遵循后台工作台标准：查询区一行 3 个字段、表格内部滚动、表头 48px、数据行 40px、字段设置、列宽持久化、行点击抽屉、数据审计。
- 后端固定端口 8081，前端固定端口 3000，前端通过 Vite `/api` 代理访问后端；如果 3000 被占用，先处理占用进程，不要临时改用 3002 或其他端口。
- 后端必须使用 Java 21，当前机器默认 Java 版本可能不适配。
- 模板建模相关文件目前有未跟踪文件，不要误删。
- 所有保存、删除、导入、设计保存等用户操作都应写入真实审计，不允许前端伪造审计。
- 若用户只说“继续”，默认继续当前未完成任务，不要重新询问方向。

## 2. 项目基础信息

- 产品定位：商业级可定制 eDHR 平台，面向批次/SN 生产记录、DHR 汇总、审核放行、追溯和受控电子记录场景。
- 前端：React 18、TypeScript、MUI、Vite、React Query、React Router、Zustand。
- 后端：Spring Boot 3.3、Java 21、Maven、Spring Security、JPA、Liquibase、PostgreSQL。
- 数据库：PostgreSQL 16 或兼容版本。
- API 口径：后端接口统一在 `/api/v1` 下，OpenAPI 为 `/api-docs`，Swagger 为 `/swagger-ui.html`。
- 文件存储：后端默认 `./uploads`，可通过 `FILE_UPLOAD_DIR` 覆盖。
- 当前前端菜单来源：`gmp-platform/frontend/src/utils/constants.ts` 和 `gmp-platform/frontend/src/utils/menuManagement.ts`。

## 3. 当前项目进度

已完成或基本可用：

- 系统模块：
  - 组织管理：组织架构、岗位角色、用户管理。
  - 系统管理：菜单管理、业务字典、图标管理、系统设置。
  - 安全管理：登录日志、审计日志、签名记录。
  - 个人设置：基础信息、账号绑定、电子签名认证、授权通知书预览等已多轮调整。
- 数据模块：
  - 工艺建模：物料管理、工序管理、工艺路线、产品管理、产品簇、文档管理。
  - 产品管理按用户要求作为物料管理派生视图：半成品和产成品物料进入产品管理。
  - 模板建模：表单模板、批记录模板菜单和页面骨架已建立。
- 模板建模：
  - 表单模板按“模板主档 + 模板版本”建模。
  - 支持分类、查询、字段设置、主表/版本表、详情抽屉、数据审计、全屏设计器。
  - 表单模板导入支持 PDF、Word、Excel、图片；PPT/PPTX 当前明确不纳入自研导入范围。
  - 设计器已开始支持“图层锚定 + 格式复刻”结构、画布层、解析候选、候选确认、字段/文本拖拽放置和保存。
  - 候选确认已要求显式处理全部候选；导入失败会回滚到导入前设计器状态；重新打开带 pending analysis draft 的版本会尝试恢复候选确认面板。
  - OnlyOffice 已按 PoC 方式接入：后端提供 editor config/callback，前端提供原文编辑/预览入口，Docker Compose 增加 Document Server 服务；但仍不要用 OnlyOffice 替换 Zencas 自有结构化字段层。

在建且需要特别注意：

- 模板建模前后端文件大量处于未跟踪状态，属于当前开发成果的一部分。
- `TemplateModelingController.java` 体量较大，已包含导入解析、文件存储、PDF/Excel/Word/图片解析、审计和分类逻辑。后续建议拆分服务，但当前不要为了拆分而扩大改动。
- 表单模板导入后的高保真还原仍是核心难点，当前实现是可运行的基础版本，不等于已达到 OnlyOffice 级别还原。
- OnlyOffice Docker Compose 已接入配置，但当前 Codex 环境没有 `docker` CLI，尚未在本机完成 `docker compose config` 或 Document Server 启动验证。

## 4. 文件结构说明

仓库根目录：

```text
.
├── README.md
├── docs
│   ├── architecture
│   ├── design-audit
│   ├── development
│   ├── prd
│   └── superpowers
└── gmp-platform
    ├── backend
    ├── frontend
    └── docker-compose.yml
```

前端关键目录：

```text
gmp-platform/frontend
├── src/api                  # axios API 封装
├── src/components           # 通用组件
├── src/features/gct-edhr    # GCT 模块
├── src/pages/system         # 系统模块页面
├── src/pages/master-data    # 数据模块页面
├── src/pages/account        # 个人设置
├── src/router               # 路由
├── src/utils                # 菜单、常量、图标等
└── scripts                  # 前端结构化 verifier
```

后端关键目录：

```text
gmp-platform/backend/src/main/java/com/zencas/edhr
├── common       # 通用 DTO、异常、审计切面、配置
├── compliance   # 审计、电子签名、文件、OCR
├── identity     # 用户、组织、角色、权限、登录
├── masterdata   # 工艺建模、物料、工序、路线、产品
├── system       # 图标管理、业务字典、系统设置
├── template     # 表单模板、模板建模、批记录模板相关
└── workflow     # 流程中心、状态机、流程实例
```

关键文档：

- `docs/design-audit/organization-management-ui-standard.md`：当前后台页面 UI/交互标准，必须优先遵循。
- `docs/development/startup-commands.md`：历史启动说明，注意部分内容可能滞后当前配置。
- `docs/superpowers/specs/2026-06-23-template-modeling-design.md`：模板建模设计规格。
- `docs/superpowers/plans/2026-06-24-form-template-import-engine.md`：表单模板导入引擎计划。
- `docs/prd/edhr-mvp-prd.md`、`docs/prd/edhr-commercial-prd.md`：产品 PRD。

## 5. 规范说明

后台工作台标准：

- 查询区一行 3 个字段，查询和重置按钮尺寸一致且居右。
- 表格使用内部滚动，不允许页面级横向或纵向滚动条。
- 表头高度 48px，数据行高度 40px。
- 空数据、加载中、加载失败状态必须撑满表格容器。
- 表格字段设置必须支持字段显隐、拖拽排序、列宽拖拽，并按当前用户持久化。
- 操作列用图标按钮和 Tooltip，不使用行内文字按钮。
- 行点击打开详情抽屉；复选框、操作按钮必须阻止冒泡。
- 抽屉 Tab 固定为“数据信息”和“数据审计”。
- 数据审计使用手风琴效果，每笔变更一行，展开后展示变更前/变更后。
- 无审计记录文案统一为“暂无审计记录”。

审计标准：

- 新增写完整快照，修改只写实际变化字段。
- 列表页不展示原始操作数据，操作数据放到详情抽屉的数据审计中。
- 审计字段必须翻译为中文业务名称，避免直接暴露技术字段 key。
- 涉及文件、图标、Logo、浏览器 icon、签名图片等，需要保存并展示快照信息。
- 审计日志要回答：什么人、什么账号、什么时间、以什么方式、在哪个模块/菜单/功能、操作了什么数据、变更前后是什么。

模板建模标准：

- 表单模板必须是“模板主档 + 多版本”。
- 表单编码和版本号由用户填写，不自动生成。
- 新增弹窗使用“基础信息”和“版本信息”两张卡片。
- 新增弹窗按钮为：取消、保存、保存并设计。
- 主表只有一个版本时，删除按钮在主表行；多个版本时，删除按钮在子版本行。
- 新增子版本不能覆盖当前行已有版本数据。
- 设计按钮只在版本行显示。
- 设计器当前是全屏界面，不使用抽屉。
- 文件导入当前支持 Excel、Word、PDF、图片，不考虑 PPT。

## 6. 核心逻辑说明

菜单和路由：

- 前端路由：`gmp-platform/frontend/src/router/index.tsx`。
- 菜单默认配置：`gmp-platform/frontend/src/utils/constants.ts`。
- 菜单运行时兜底和本地持久化：`gmp-platform/frontend/src/utils/menuManagement.ts`。
- 数据模块当前包含：
  - 工艺建模：物料管理、工序管理、工艺路线、产品管理、产品簇、文档管理。
  - 模板建模：表单模板、批记录模板。
- 系统模块当前包含：
  - 组织管理：组织架构、岗位角色、用户管理。
  - 系统管理：菜单管理、业务字典、图标管理、系统设置。
  - 安全管理：登录日志、审计日志、签名记录。

API 客户端：

- 前端 axios 实例：`gmp-platform/frontend/src/api/client.ts`。
- `baseURL` 为 `/api/v1`。
- 请求自动附带 `localStorage.token`。
- 后端返回 `code !== 200` 时会 reject，并优先使用后端 message。
- 401 会清理登录态并跳转 `/login`。

模板建模后端接口：

- 控制器：`gmp-platform/backend/src/main/java/com/zencas/edhr/template/controller/TemplateModelingController.java`。
- 基础路径：`/api/v1/master-data/template-modeling`。
- 表单模板：
  - `GET /form-templates`
  - `POST /form-templates`
  - `PUT /form-templates/{id}`
  - `DELETE /form-templates/{id}`
  - `POST /form-templates/{id}/versions`
  - `GET /form-templates/{id}/versions/{versionId}`
  - `DELETE /form-templates/{id}/versions/{versionId}`
  - `PUT /form-templates/{id}/versions/{versionId}/design`
  - `POST /form-templates/{id}/versions/{versionId}/import`
- 批记录模板：
  - `GET /batch-record-templates`
  - `POST /batch-record-templates`
  - `PUT /batch-record-templates/{id}`
  - `DELETE /batch-record-templates/{id}`
- 分类：
  - `GET /{templateType}/categories`
  - `POST /{templateType}/categories`
  - `PUT /{templateType}/categories/{id}`
  - `DELETE /{templateType}/categories/{id}`
  - `PUT /{templateType}/categories/order`

模板建模前端：

- 页面：`gmp-platform/frontend/src/pages/master-data/TemplateModelingPage.tsx`。
- API：`gmp-platform/frontend/src/api/template-modeling.ts`。
- verifier：`gmp-platform/frontend/scripts/verify-template-modeling-pages.mjs`。
- 重要状态：
  - `modelDesignJson`：字段模型、字段候选、字段类型等。
  - `canvasDesignJson`：画布页面、背景层、文本层、线条层、图片层、交互字段。
  - `workflowDesignJson`：流程设计，当前主要预留。

表单模板导入设计：

- 上传真实源文件，写入 `FileObject`。
- 后端解析文件，生成 analysis draft、候选清单、`modelDesignJson` 和 `canvasDesignJson`。
- 导入不会自动把所有候选变成交互字段；用户必须确认每个候选为“组件 / 静态文字 / 忽略”。
- 标题类文本会优先建议为静态文字，冒号类键值标签会把填报锚点建议到标签右侧。
- 解析候选会携带键值语义元数据：`sourceText`、`keyText`、`valueText`、`semanticRole`、`pairing`；前端候选确认面板会显示键、值和角色，便于用户判断组件/静态文字/忽略。
- 每次重新导入应先清空当前画布，再渲染新导入内容。
- PDF/图片需要考虑渲染背景、矫正和线条层。
- Excel 需要尽量还原行高、列宽、边框、合并单元格、文字位置和图片。
- Word 当前自研解析仍是基础结构解析，高保真原文编辑/预览走 OnlyOffice 或独立转换服务。
- OnlyOffice PoC：用其负责文档渲染/编辑/协同，Zencas 自己存结构化字段覆盖层、填报数据、审计和发布状态。
- OnlyOffice `document.url` 必须使用表单模板版本专用的 `/api/v1/master-data/template-modeling/form-templates/{id}/versions/{versionId}/onlyoffice/source?token=...` 签名地址，不能回退到平台鉴权的 `/api/v1/files/{id}/preview`；普通文件 preview 仍应要求平台 JWT。
- OnlyOffice callback 已校验 JWT、document key、下载 host，并对缺 URL、失败状态、下载失败写安全审计；下载编辑后文件时已禁用自动跨域重定向、设置超时并限制最大 50MB。

## 7. 环境变量与配置

后端配置：

- 主配置：`gmp-platform/backend/src/main/resources/application.yml`
- 本地 dev 配置：`gmp-platform/backend/src/main/resources/application-dev.yml`
- 固定端口：`server.port=8081`
- 默认 profile：`dev`
- 数据库：
  - `jdbc:postgresql://localhost:5432/edhr_dev`
  - 用户名：`edhr`
  - 密码：`edhr_dev_pwd`
- Liquibase：当前 `application-dev.yml` 中为 `enabled: true`，会按 `db.changelog-master.yaml` 执行。
- JWT：
  - `JWT_SECRET`
  - 默认值只适合开发环境，不得用于生产。
- 文件：
  - `FILE_UPLOAD_DIR`
  - 默认 `./uploads`
- OCR：
  - `OCR_PADDLE_ENABLED`
  - `OCR_PADDLE_PYTHON_COMMAND`
  - `OCR_PADDLE_SCRIPT_PATH`
  - `OCR_PADDLE_TIMEOUT_SECONDS`

前端配置：

- Vite 配置：`gmp-platform/frontend/vite.config.ts`
- 前端端口：`3000`
- 前端端口规范：本地启动、浏览器验证、文档和对外沟通固定使用 `http://localhost:3000`；不得通过 `--port 3002` 或其他临时端口绕开占用。
- 代理：`/api -> http://localhost:8081`
- API 客户端不需要单独配置后端域名，开发期通过 Vite 代理。

Docker Compose：

- 文件：`gmp-platform/docker-compose.yml`
- PostgreSQL：宿主机 `5432`
- 后端：宿主机 `8081`
- 前端：宿主机 `3000`
- 后端 Dockerfile 依赖已构建 jar，启动 Compose 前需要先后端打包。

## 8. 启动、运行、测试方式

后端本地启动：

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/backend

export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"

mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

后端后台启动常用方式：

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/backend

export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"

screen -dmS edhr-backend-8081 zsh -lc 'mvn spring-boot:run -Dspring-boot.run.profiles=dev > /tmp/zencas-edhr-backend-8081.log 2>&1'
```

后端健康验证：

```bash
curl -fsS http://localhost:8081/api-docs
open http://localhost:8081/swagger-ui.html
lsof -nP -iTCP:8081 -sTCP:LISTEN
```

前端启动：

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend
npm ci
npm run dev
```

前端访问：

```text
http://localhost:3000
```

前端构建：

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend
npm run build
```

常用前端 verifier：

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend

npm run verify:app-shell
npm run verify:organization
npm run verify:user-management
npm run verify:role-management
npm run verify:menu-management
npm run verify:business-dictionary
npm run verify:system-management-pages
npm run verify:audit-log-page
npm run verify:personal-settings
npm run verify:process-modeling
npm run verify:template-modeling
npm run verify:no-external-fonts
```

模板建模后端测试：

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/backend

export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"

mvn test \
  -Dtest=TemplateModelingControllerTest,SecurityConfigTest,PaddleOcrClientTest \
  -DargLine="-javaagent:/Users/wangzilin/.m2/repository/net/bytebuddy/byte-buddy-agent/1.14.16/byte-buddy-agent-1.14.16.jar"
```

全量后端测试：

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/backend

export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"

mvn test \
  -DargLine="-javaagent:/Users/wangzilin/.m2/repository/net/bytebuddy/byte-buddy-agent/1.14.16/byte-buddy-agent-1.14.16.jar"
```

Docker Compose：

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
mvn -DskipTests package

cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform
docker compose up --build
```

OnlyOffice PoC 说明：

- `docker-compose.yml` 已包含 `onlyoffice-document-server`，端口映射为 `8088:80`。
- 后端 compose 环境会设置 `ONLYOFFICE_ENABLED=true`、`ONLYOFFICE_DOCUMENT_SERVER_URL=http://localhost:8088`、`ONLYOFFICE_PUBLIC_BACKEND_URL=http://localhost:8081`、`ONLYOFFICE_JWT_SECRET` 和 `ONLYOFFICE_DOWNLOAD_ALLOWED_HOSTS`。
- 2026-06-26 本轮 Codex 环境仍无 `docker` CLI；`curl http://localhost:8088/healthcheck` 返回连接失败。因此 Docker 语法、OnlyOffice Document Server 启动、DocsAPI iframe 实际加载和保存回调闭环仍需要在有 Docker CLI 的机器上验证。

## 9. 已知问题与坑

- 不要使用默认 Java 版本直接跑后端。当前环境默认 Java 可能不是 21，Maven 编译/测试可能失败。
- Mockito inline 相关测试可能需要 Byte Buddy `-javaagent`，尤其是 `TemplateModelingControllerTest`。
- `docs/development/startup-commands.md` 部分描述可能滞后，当前以 `application.yml` 和 `application-dev.yml` 为准：dev Liquibase 当前是启用状态。
- 如果 `screen -S edhr-backend-8081 -X quit` 后 8081 仍被占用，要用 `lsof` 查 Java/Maven 子进程并清理。
- `/actuator/health` 不是当前可靠健康检查入口，优先用 `/api-docs` 或 Swagger。
- 前端 verifier 是字符串/结构契约检查，失败时先读 verifier 里的具体断言，不要盲改页面。
- 菜单管理有 localStorage 持久化，菜单不显示时可能是本地旧菜单缓存，需要检查 `edhr:managed-sidebar-modules`。
- Snowflake 64 位 ID 在前端必须按字符串处理，尤其是文件 ID、授权通知书、签名相关接口，避免 JS 数字精度截断。
- 审计不能用当前关联表反查来伪装历史名称，关联对象名称应在写审计时保存快照。
- 模板建模当前未跟踪文件较多，不要用清理未跟踪文件的命令。
- `TemplateModelingController.java` 当前承担过多职责，短期修 bug 先精准修改，长期再拆服务。
- OnlyOffice Community 涉及 AGPLv3，建议独立部署 Document Server 并通过 Docs API/iframe 集成；不要修改 OnlyOffice 源码后直接闭源分发。

## 10. 最近修改记录

当前工作树显示的主要修改方向：

- 更新后台工作台标准文档：`docs/design-audit/organization-management-ui-standard.md`。
- 后端新增/调整模板建模、模板版本、导入解析、源文件 ID、文件预览、OCR 相关能力。
- 后端 `pom.xml` 增加 PDFBox、Apache POI 等文档解析依赖。
- 后端数据库 changelog 增加模板建模、模板版本源文件 ID 等脚本。
- 前端新增模板建模 API、页面和 verifier。
- 前端菜单和路由增加数据模块下“模板建模 / 表单模板 / 批记录模板”。
- 前端 `package.json` 增加模板建模 verifier 脚本。
- 表单模板设计器已多轮调整：全屏设计、顶部工具栏、分页缩略图、拖拽宽度、字段/文本拖拽到画布、导入前清空画布、保存设计。
- 表单模板导入范围最终为 Excel、Word、PDF、图片，不考虑 PPT。
- 2026-06-26：候选确认闭环已加强，后端要求所有解析候选必须显式确认；analysis block 保留解析来源；OnlyOffice callback 增加 document key 校验、缺 URL/失败状态审计；Docker Compose 增加 OnlyOffice Document Server。
- 2026-06-26：继续补强导入/OnlyOffice 安全和前端恢复链路：后端拒绝错配/重复确认的 analysis draft、限制候选组件类型和重复字段编码、持久化 analysis draft 顶层 revision、OnlyOffice 下载拒绝非白名单重定向并限制大小；前端导入失败回滚旧画布和候选状态，重新打开未确认草稿时调用 analysis draft 接口恢复确认面板。
- 2026-06-26：解析候选增加键值对语义元数据，冒号标签、Word/Excel/PDF 文本候选会暴露 `sourceText/keyText/valueText/semanticRole/pairing`；前端候选确认面板显示“键 / 值 / 角色”，便于用户确认哪些转组件、哪些保留静态文字。
- 2026-06-26：OnlyOffice 配置改为使用表单模板版本专用 `/onlyoffice/source?token=...` 签名源文件 URL，SecurityConfig 仅放行该 GET 和 callback POST；普通 `/api/v1/files/{id}/preview` 继续走平台 JWT。

当前 `git status` 中模板建模相关未跟踪文件包括：

```text
backend/src/main/java/com/zencas/edhr/template/controller/TemplateModelingController.java
backend/src/main/java/com/zencas/edhr/template/dto/TemplateModelingRequest.java
backend/src/main/java/com/zencas/edhr/template/entity/FormTemplate.java
backend/src/main/java/com/zencas/edhr/template/entity/TemplateCategory.java
backend/src/main/java/com/zencas/edhr/template/repository/FormTemplateRepository.java
backend/src/main/java/com/zencas/edhr/template/repository/TemplateCategoryRepository.java
backend/src/main/resources/db/changelog/0033-template-modeling-management.sql
backend/src/main/resources/db/changelog/0034-template-version-source-file-id.sql
backend/src/test/java/com/zencas/edhr/template/controller/TemplateModelingControllerTest.java
frontend/scripts/verify-template-modeling-pages.mjs
frontend/src/api/template-modeling.ts
frontend/src/pages/master-data/TemplateModelingPage.tsx
```

## 11. 下一步开发计划

优先级 1：表单模板导入稳定化

- 复现并修复 Excel/Word/PDF/图片导入后的版式还原问题。
- 确认重复导入时画布会先清空再加载新解析结果。
- 对导入接口补充更细的错误提示，避免只显示 500。
- 继续补齐后端解析测试和前端 verifier。
- 浏览器 QA：登录后进入 `/master-data/form-templates`，使用真实数据上传文件，确认画布更新、保存设计、刷新后恢复。

优先级 2：OnlyOffice PoC 方案

- 不要直接替换现有设计器。
- 新增一个 OnlyOffice 编辑/预览模式作为 PoC。
- OnlyOffice 负责源文件高保真渲染、在线编辑、协同。
- Zencas 自己保存结构化覆盖层 JSON：字段组件、坐标、绑定、校验、填报权限、审计。
- 后端需要提供 OnlyOffice config 接口、callback 接口、文件访问 URL 和 JWT/签名校验。

优先级 3：模板建模代码治理

- 将 `TemplateModelingController.java` 中的导入解析逻辑拆到 service/parser 层。
- 分离 PDF、图片、Excel、Word parser。
- 抽出审计快照翻译和模板版本响应组装逻辑。
- 保持接口契约不变，先补测试再拆。

优先级 4：批记录模板深化

- 当前批记录模板主要是列表和基础模板形态。
- 后续需要和产品、工艺路线、表单模板组合。
- 需要支持批记录模板版本、发布状态、流程配置、电子签名、放行审计。

优先级 5：统一标准组件

- 当组织架构、用户管理、岗位角色、业务字典、工艺建模、模板建模稳定后，再抽通用：
  - 查询区组件
  - 字段设置组件
  - 表格列宽持久化 hook
  - 详情抽屉组件
  - 审计手风琴组件
  - 分类左栏组件

## 12. 接手前检查清单

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案

git -C gmp-platform status --short --branch --untracked-files=all
git -C gmp-platform diff --stat

sed -n '1,220p' docs/design-audit/organization-management-ui-standard.md
sed -n '1,220p' docs/superpowers/specs/2026-06-23-template-modeling-design.md
sed -n '1,260p' docs/superpowers/plans/2026-06-24-form-template-import-engine.md
```

接手后第一轮建议验证：

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend
npm run verify:template-modeling
npm run build

cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
mvn test -Dtest=TemplateModelingControllerTest,SecurityConfigTest,PaddleOcrClientTest -DargLine="-javaagent:/Users/wangzilin/.m2/repository/net/bytebuddy/byte-buddy-agent/1.14.16/byte-buddy-agent-1.14.16.jar"
```
