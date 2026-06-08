# 前后端启动命令

本文档基于当前仓库文件确认启动方式：

- 前端工程：`gmp-platform/frontend`
- 后端工程：`gmp-platform/backend`
- 容器编排：`gmp-platform/docker-compose.yml`

## 1. 环境要求

### 前端

- Node.js 18+，当前验证环境为 Node.js `v22.21.0`
- npm，当前验证环境为 npm `10.9.4`
- 包管理器使用 npm，因为前端目录存在 `package-lock.json`

### 后端

- JDK 21
- Maven 3.x，当前验证环境为 Maven `3.9.16`
- PostgreSQL 16 或兼容版本

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

注意：`application-dev.yml` 中 `spring.liquibase.enabled=false`，本地 dev 启动不会自动跑 Liquibase。若数据库没有表结构，需要先导入 `gmp-platform/backend/src/main/resources/db/changelog` 下的初始化脚本，或临时开启 Liquibase。

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
