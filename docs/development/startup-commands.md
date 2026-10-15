# 前后端启动命令

本文档基于当前仓库文件确认启动方式：

- 前端工程：`gmp-platform/frontend`
- 后端工程：`gmp-platform/backend`
- 容器编排：`gmp-platform/docker-compose.yml`

本机当前统一环境为 `edhr-dev` 的 `3000/8081`，沿用既有模拟数据库；实际启动命令见第4.3节，避免误连到另一个开发库。

## 1. 环境要求

### 前端

- Node.js 18+，当前验证环境为 Node.js `v22.21.0`
- npm，当前验证环境为 npm `10.9.4`
- 包管理器使用 npm，因为前端目录存在 `package-lock.json`

### 后端

- JDK 21
- Maven 3.x，当前验证环境为 Maven `3.9.16`
- PostgreSQL 16 或兼容版本
- Node/npm 及已安装的前端依赖（Maven 会构建随 JAR 发布的离线 DHR 打印资源）
- Playwright 1.58 对应 Chromium；Linux 还需浏览器系统依赖和 Noto CJK 中文字体

首次运行先在 `gmp-platform/frontend` 执行 `npm ci`，再在 `gmp-platform/backend` 执行：

```bash
mvn exec:java -Dexec.mainClass=com.microsoft.playwright.CLI -Dexec.args="install chromium"
```

Linux 原生环境使用 `install --with-deps chromium` 并安装 `fonts-noto-cjk`。容器依赖由后端 Dockerfile 提供；不要跳过 Maven 的 `generate-resources` 阶段，否则 JAR 会缺少 `dhr-print/renderer.js`。详细边界见 `docs/dhr-management-handoff.md` 第10节。

注意：当前机器默认 `java` 是 Java 26，后端使用 Java 26 编译会失败。必须使用 JDK 21。当前机器可用的 JDK 21 路径为：

```bash
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
```

## 2. 端口与代理口径

### 前端

前端 Vite 开发服务器端口来自 `gmp-platform/frontend/vite.config.ts`：

```text
http://localhost:3000
```

本项目本地前端端口固定只使用 `3000`。如果 `3000` 被占用，必须先确认并处理占用进程，不得临时改用 `3002` 或其他端口绕开；浏览器验证、文档和对外沟通也统一使用 `http://localhost:3000`。

前端 API 客户端使用 `baseURL: /api/v1`，开发期由 Vite 代理 `/api`：

```text
/api -> http://localhost:8081
```

### 后端

后端默认配置来自 `application.yml`：

```text
server.port = 8081
spring.profiles.active = dev
```

默认激活 `dev` profile，但 `application-dev.yml` 不再覆盖端口，因此本地开发、前端代理和 Docker 口径统一为：

```text
server.port = 8081
```

## 3. 数据库启动

后端本地开发配置连接：

```text
url      = jdbc:postgresql://localhost:5432/edhr_dev
username = edhr
password = edhr_dev_pwd
```

如果本地已经有 PostgreSQL，只需确认数据库可连接：

```bash
pg_isready -h localhost -p 5432 -U edhr -d edhr_dev
```

如果需要手动创建数据库和用户，可参考：

```bash
createuser edhr
createdb edhr_dev -O edhr
psql -d edhr_dev -c "ALTER USER edhr WITH PASSWORD 'edhr_dev_pwd';"
```

`application.yml` 和 `application-dev.yml` 均启用了 Liquibase。后端每次启动会按 `gmp-platform/backend/src/main/resources/db/changelog/db.changelog-master.yaml` 的顺序执行尚未应用的迁移，并记录到 PostgreSQL 的 `databasechangelog` 表。

因此，拉取包含后端和数据库变更的代码后，必须停止旧的后端进程并重新启动后端；只重启前端不会同步数据库结构。不要手工导入某一个初始化 SQL，也不要修改已经执行过的迁移文件。新增数据库变更应新建一个递增编号的 SQL 文件，并将其加入主 changelog。

可用以下查询确认批记录模板的版本化迁移已经执行：

```sql
SELECT id, filename, dateexecuted
FROM databasechangelog
WHERE filename LIKE '%0043-dhr-template-version-metadata.sql%';
```

有返回记录时，`dhr_template.code` 已允许为空，批记录模板编码由 `dhr_template_version.code` 保存。

## 4. 本地开发启动

### 4.1 启动后端，固定端口 8081

```bash
cd gmp-platform/backend

export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"

mvn spring-boot:run
```

启动后访问：

```text
http://localhost:8081/swagger-ui.html
http://localhost:8081/api-docs
```

如需临时覆盖端口，可显式传入 `--server.port=端口号`，但本地前端联调默认使用 `8081`。

### 4.2 启动前端

```bash
cd gmp-platform/frontend
npm ci
npm run dev
```

启动后访问：

```text
http://localhost:3000
```

若启动时提示 `3000` 端口占用，先用以下命令定位占用来源，再决定是否停止旧的前端进程：

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

不要通过 `--port 3002` 或其他端口临时启动前端。

### 4.3 本机当前统一环境（2026-10-15）

投影分支已合入 `edhr-dev`，主目录 `/Users/ivenwang/Documents/edhr-nexus` 后续使用该分支。前端统一 `3000`、后端统一 `8081`、PostgreSQL 服务端口仍为 `5432`；不再运行原 `3007/8087` 或本轮隔离验收的 `3017/8097`。

为保留已导入表单及安速康模拟，本机继续使用现有数据库 `edhr_form_projection`，文件目录配置沿用后端目录下的 `uploads-projection`，仅通过启动参数覆盖默认数据源/文件目录。本次核对时该库无 `file_object` 记录，磁盘上也无既有上传目录，因而不声称核验过实际附件内容。数据库名称不表示当前仍使用投影分支；不将其替换为另一个 `edhr_dev` 库，也不移动或补算历史记录。仓库通用默认配置仍为第3节的 `edhr_dev`。

本机后端开发启动：

```bash
cd /Users/ivenwang/Documents/edhr-nexus/gmp-platform/backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/edhr_form_projection \
FILE_UPLOAD_DIR=./uploads-projection \
OCR_PADDLE_ENABLED=false \
mvn spring-boot:run
```

已打包后也可在同一目录使用相同环境变量运行 `java -jar target/edhr-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev`。前端在主目录的 `gmp-platform/frontend` 执行：

```bash
VITE_API_PROXY_TARGET=http://localhost:8081 npm run dev -- --port 3000 --strictPort
```

开始或恢复开发时先检查本地改动，再获取并核对 `origin/edhr-dev` 和契约增量；只在工作区允许时快进或安全合并，不用强制重置覆盖协作者改动。后端代码或迁移更新后重新构建启动，前端依赖变化时同步依赖；Git 分支更新本身不会替换已运行的后端进程。

## 5. 构建命令

### 前端构建

```bash
cd gmp-platform/frontend
npm ci
npm run build
```

### 后端打包

```bash
cd gmp-platform/backend

export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"

mvn -DskipTests package
```

产物：

```text
gmp-platform/backend/target/edhr-0.0.1-SNAPSHOT.jar
```

## 6. Docker Compose 启动

当前 `docker-compose.yml` 包含：

- `postgres`：PostgreSQL，宿主机端口 `5432`
- `backend`：后端，宿主机端口 `8081`
- `frontend`：Nginx 托管前端，宿主机端口 `3000`

后端 Dockerfile 不在镜像里执行 Maven 编译，只复制 `target/*.jar`，因此启动 Compose 前必须先打包后端：

```bash
cd gmp-platform/backend

export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"

mvn -DskipTests package
```

然后启动：

```bash
cd gmp-platform
docker compose up --build
```

访问地址：

```text
前端: http://localhost:3000
后端: http://localhost:8081
Swagger: http://localhost:8081/swagger-ui.html
```

## 7. 本次验证结果

已验证通过：

```bash
cd gmp-platform/backend
JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home mvn spring-boot:run
```

结果：后端启动日志显示 `Tomcat started on port 8081 (http)`。验证后已停止临时后端进程。

已验证通过：

```bash
cd gmp-platform/frontend
npm run build
```

结果：前端构建成功。

已验证通过：

```bash
cd gmp-platform/backend
JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home mvn -DskipTests package
```

结果：后端打包成功，生成 `target/edhr-0.0.1-SNAPSHOT.jar`。

已验证：

```bash
pg_isready -h localhost -p 5432 -U edhr -d edhr_dev
```

结果：本机 PostgreSQL `edhr_dev` 接受连接。

未验证：

```bash
docker compose up --build
```

原因：当前环境没有可用的 `docker` 命令。

额外发现：

- 当前本机已有 Node 进程监听 `3000`
- 使用默认 Java 26 执行后端 Maven 编译会失败，需切换 JDK 21
