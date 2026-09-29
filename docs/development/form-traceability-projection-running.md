# 追溯投影开发环境

本功能分支为 `form-traceability-projection`，从 `edhr-dev` 的 `f2710af9ea717e760fef456cad09d6304c7f4e55` 创建，直接使用项目目录。

## 隔离与启动

依赖：Java 21、Maven、Node/npm、PostgreSQL。先安装前端依赖；后端构建也会构建 DHR 打印资源。

```sh
git fetch origin
git switch form-traceability-projection
cd gmp-platform/frontend
npm ci
```

在本地 PostgreSQL 创建空数据库（不要从现有业务库复制真实数据）。已有仓库开发账号 `edhr` 时直接创建；没有该账号时先按项目本地开发说明创建账号，或自行创建专用账号并用下述环境变量配置。数据库创建者需要本机建库权限：

```sh
createdb -O edhr edhr_form_projection
```

后端在 `gmp-platform/backend` 启动，Liquibase 自动迁移独立库：

```sh
mvn spring-boot:run -Dspring-boot.run.profiles=projection
```

前端在 `gmp-platform/frontend` 启动：

```sh
VITE_API_PROXY_TARGET=http://localhost:8087 npm run dev -- --port 3007 --strictPort
```

数据库账号、密码和 URL 可以用 `PROJECTION_DATABASE_USER`、`PROJECTION_DATABASE_PASSWORD`、`PROJECTION_DATABASE_URL` 覆盖；本地默认凭据沿用仓库开发账号。不要将生产连接或密钥写入提交。上传目录默认独立为 `uploads-projection`，可用 `PROJECTION_UPLOAD_DIR` 指定。只启用 `projection` profile，不同时启用 `dev`。

端口 8087/3007 分别对应本功能后端和前端；已有 5432 数据库服务可共用，数据库名称独立。Git 分支本身不隔离数据。切回其他分支前停止本功能进程，避免同目录热更新加载其他分支文件。

## 接手时的只读清点

2026-09-29：原 `edhr_dev` 有 3 个模板版本、13 份实例（11 完成、2 活动）；1 个模板版本含旧 `businessPurpose`。本功能不删除、转换或重建这些历史数据。无关 `output/` 和 `gmp-platform/frontend/output/` 不进入提交。

## 虚构演示

后端启动成功后，在 `gmp-platform/backend` 运行：

```sh
python3 scripts/form-projection-demo.py
```

脚本只允许本机 `edhr_form_projection` / `8087`，需要 Python 3、可连接该库的 `psql` 与开发管理员登录。`psql` 沿用本机 PGUSER/PGPASSWORD 等连接配置；`PROJECTION_DEMO_PASSWORD` 可覆盖初始化管理员密码（默认沿用仓库初始化值）。脚本不打印令牌。

脚本创建 `PROJECTION-DEMO2-*` 虚构主数据（ID 980001–980020），随后通过真实 API 启动生产执行、暂存、最终完成并等待投影。断言暂存不投影、两个工序各100件、4条消耗明细、同条条件不跨组误配、使用时快照中的来源值及真实DHR关联。重复运行成功样本不会改写完成记录。运行前不要自行占用该虚构ID区间。

访问 `http://localhost:3007`，菜单“记录 → 报表 → 追溯与统计”。本机还保留早期虚构样本作开发证据，可展开筛选并输入生产对象编号 `PROJECTION-DEMO2-BATCH` 只看当前演示。新拉取环境只会产生当前演示样本。表单追溯按实例去重，展开详情查看所有命中；报工、报废、消耗可切换“来源明细／按工序用途合计”。

模板的全表入口及普通字段快捷入口编辑同一配置。未完成配置可保存；启用用途在生产对象首次执行或后续挂接表单时必须通过校验，配置随执行快照固定。模板版本仍可编辑，修改后的配置只影响之后使用它的实例。演示版无审批配置，提交即最终完成；有审批流程的模板仍由原执行引擎决定最终完成时机。

## 验证与范围

```sh
# backend；真实PostgreSQL测试在随机临时schema内执行并清理
PROJECTION_TEST_DATABASE_URL=jdbc:postgresql://localhost:5432/edhr_form_projection \
  mvn -Dexec.skip=true -Dtest=FormProjectionInterpreterTest,FormProjectionPostgresTest,FormProjectionAuthorizationTest,TemplateProjectionAuthorizationTest,TemplateModelingControllerTest,FormFillSnapshotTest,ProductionExecutionEngineTest,BusinessKnowledgeModelTest test
# frontend
npm run build
```

测试 DB 环境变量缺失时 PostgreSQL 集成测试会跳过；不能把跳过当通过。不要并行运行多个 Maven 测试进程共享同一 `target/`。2026-09-29 初始交付已运行空库全量 Liquibase、真实演示 API 闭环及浏览器来源回查；此前独立质量结果见同目录 `form-traceability-projection-quality-result.yaml`。改为使用时快照后，主开发重新运行上述139项测试（零失败、零跳过）、前端构建，并在隔离库的虚构模板上验证旧版本仍可保存；本体核对结果为 `updated`。首次独立复验发现设计保存接口缺少显式模板管理权限，修复前结果见 `form-traceability-projection-quality-use-time.yaml`；补权限后由未参与修复的全新质量实例重跑139项测试、构建和浏览器回归，最终结果 `passed`，见 `form-traceability-projection-quality-use-time-final.yaml`。独立验证未重演来源审批签署提交或生产降级演练。

交付四项标准用途：表单内容追溯、正式报工、报废、物料消耗。表单完成与待处理事件同事务，消费者原子写入结果；失败保留来源及完成状态，系统管理员填写原因后可重试，报表明确提示待处理／失败。未配置模板保留原路径，生产工作台旧汇总标为过程参考。此前分支已应用的 `projection_frozen_json` 列为演示遗留列，当前运行与界面不再读取；已启动生产执行的 `snapshot_json` 保持原样。

用户已接受首次完成范围：A12修订／作废及规则重建未覆盖；首次来源修订为1。长期记录本、不良原因件数／缺陷次数、文本自动解析实体、库存、复杂谱系、AI、批次／工单最终产出联动和客户制表试用未实现。批次产出取最终产出工序、工单汇总批次的层级已确认，但本分支工序合计不得当作最终产出。无报表导出功能。DHR链接只展示实际生产关系，不按批号字符串伪造归属。

报表分组最多显示200组并提示截断，明细分页。未做大数据量性能或全系统回归验证；当前来源授权沿用已有全局表单查看与生产执行权限，未引入字段隐藏授权模型。当前没有新增依赖投影结果的下游业务动作，后续接入必须检查成功状态，不能把“表单已完成”等同于“投影已可用”。

## 数据与恢复边界

未在原 `edhr_dev` 执行迁移、写入或历史转换。独立库新增两张投影表；0106 曾增加模板 `projection_frozen_json` 与并发版本列，前者不再参与运行，以免改写已应用 Liquibase 变更和演示历史。它共享本机PostgreSQL进程但不共享数据库表；本轮未做生产迁移或降级验证。演示重建应新建空库并重新运行迁移与脚本，不能删除真实业务库。原库记录清点保持3模板版本、13实例。
