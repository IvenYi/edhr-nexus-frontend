# 公共主体选择器与人员解析器接入说明

更新时间：2026-09-05。知识基线：0.3.12。内部研发文档，以当前源码为准；不是多租户或超大组织规模验收声明。

## 1. 两个组件分别做什么

“人员选择器”实际选择的是权限主体：用户、部门、角色。前端保存稳定引用，后端在业务需要时把引用解析成当前有效用户。

```text
SubjectSelector → SubjectRef[] → 业务配置保存
                                      ↓（真正需要人员时）
                            业务端校验/转换 DTO
                                      ↓
                               SubjectResolver
                                      ↓
                      去重用户 + 全部命中来源 + 无效来源
                                      ↓
                      业务端决定审批、通知或字段权限策略
```

选择器不决定谁有最终业务权限；解析器不创建任务、不发送通知、不决定只读优先级。表单组件相关分工见 [表单渲染器对接草案](form-process-form-renderer-integration-draft.md)。

## 2. 前端接入（已有导出）

```tsx
import { useState } from 'react';
import { SubjectSelector, type SubjectRef } from '@/components/identity/SubjectSelector';

export function AssigneeField() {
  const [subjects, setSubjects] = useState<SubjectRef[]>([]);
  return <SubjectSelector value={subjects} onChange={setSubjects} label="审批主体" />;
}
```

依赖现有 React、MUI、React Query、`AppDialog` 和应用认证环境；在已有 QueryClientProvider 下使用。弹窗有自己的临时选择状态，确认才通过 `onChange` 返回，取消不提交；业务页面自己负责持久化。

| 属性 | 类型 / 默认值 | 作用 |
| --- | --- | --- |
| `value` | `SubjectRef[]`，必传 | 已保存选择 |
| `onChange` | `(value: SubjectRef[]) => void`，必传 | 确认后的选择 |
| `disabled` | `boolean` / `false` | 禁止配置 |
| `label` | `string` / `选择主体` | 字段标题 |
| `placeholder` | `string` / `请选择用户、部门或角色` | 空值提示 |

```ts
type SubjectRef = {
  type: 'USER' | 'DEPARTMENT' | 'ROLE' | 'LEGACY';
  id: string;
  nameSnapshot: string;
  departmentScope?: 'SELF_AND_CHILDREN' | 'SELF_ONLY';
};
```

```json
[
  { "type": "USER", "id": "101", "nameSnapshot": "张三" },
  { "type": "DEPARTMENT", "id": "20", "nameSnapshot": "生产部", "departmentScope": "SELF_AND_CHILDREN" },
  { "type": "ROLE", "id": "7", "nameSnapshot": "质量审核员" }
]
```

- `id` 在前端保持字符串，避免 Snowflake/Long ID 超过 JavaScript 安全整数精度。
- `nameSnapshot` 仅供显示，不是授权依据；改名不应使引用失效。
- 部门默认 `SELF_AND_CHILDREN`（本部门及下级），可切换 `SELF_ONLY`（仅本部门）。其他类型不需要部门范围。
- `LEGACY` 仅用于旧文本展示，不是后端支持的主体类型；新配置不能生成它，也不能直接送解析器。
- 导出 `serializeSubjectRefs(value)` 返回 JSON 字符串，部门自动补默认范围；`parseSubjectRefs(text)` 用于现有字符串配置字段。解析函数不是严格的授权输入校验：非法 JSON 会变成 `LEGACY`，非数组会返回空数组。新业务优先保存结构化数组，不要用解析失败后的空数组推导“所有人”。

## 3. 选择行为与数据依赖

- 用户页按组织树筛选成员；选择组织只是筛选，勾选用户保存 `USER`，不会变成动态部门主体。当前成员筛选包含所选组织下级。
- 部门页勾选保存 `DEPARTMENT`，人员以后在运行时解析；父部门含下级与子部门可以同时存在，最终由解析器去重并保留来源。
- 角色页保存 `ROLE`。用户组、部门负责人、业务责任人未进入现有可选类型。
- 同类同 ID 的选择按 `type:id` 去重；同一部门在一次选择中是一项，可修改范围，不同时保存两个范围。
- 当前候选入口隐藏用户名 `admin`/名称“系统管理员”的用户，以及编码 `ADMIN`/名称“系统管理员”的角色。它只是 UI 过滤，不构成后端管理员授权契约；解析器也不会自动给管理员特殊权限。

通过 [identity API 封装](../../gmp-platform/frontend/src/api/identity.ts) 调用 `getUsers`、`getRoles`、`getDepartmentTree`，实际路径分别为 `/api/v1/identity/users`、`/api/v1/identity/roles`、`/api/v1/identity/departments/tree`。使用页面必须有权读取这些目录，组件不会替调用方开权限。

当前用户/角色按每次 200 条循环拉取全部数据，再前端搜索和每页 50 项展示；组织树全量加载。不要误认成服务端搜索、懒加载或虚拟列表。大量用户/深层组织的性能需专项验证，未来优化应集中在公共组件与身份目录 API，不由各页面复制实现。查询 key 固定，账户或权限上下文切换需由应用清理/刷新相关缓存。

## 4. 后端接入（现有 Spring 服务，不是 HTTP 端点）

包名：`com.zencas.edhr.identity.service.SubjectResolver`，由 Spring 注入。

```java
SubjectResolution resolve(Collection<SubjectReference> configuredSubjects);
SubjectResolution resolve(Long tenantId, Collection<SubjectReference> configuredSubjects);
```

DTO 位于 `com.zencas.edhr.identity.dto`：

```java
public record SubjectReference(SubjectType type, Long id, DepartmentScope departmentScope) {}
public record ResolvedSubjectUser(Long userId, Set<SubjectReference> sources) {}
public record SubjectResolution(List<ResolvedSubjectUser> users, Set<SubjectReference> unresolvedSubjects) {}
```

`SubjectType` 为 `SubjectReference` 内嵌枚举，只含 `USER`、`DEPARTMENT`、`ROLE`；`DepartmentScope` 也为内嵌枚举，取值与前端一致。知识规则中的 `SELF`/`SELF_AND_DESCENDANTS` 是语义名称，不能直接作为 Java 枚举传入。

以下代码放在已注入 `subjectResolver` 的服务方法内即可调用（ID 为示例）：

```java
var refs = List.of(
    new SubjectReference(SubjectReference.SubjectType.DEPARTMENT, 20L,
        SubjectReference.DepartmentScope.SELF_AND_CHILDREN),
    new SubjectReference(SubjectReference.SubjectType.ROLE, 7L, null)
);
SubjectResolution result = subjectResolver.resolve(refs);
List<Long> userIds = result.users().stream().map(ResolvedSubjectUser::userId).toList();
// 调用方必须检查 unresolvedSubjects，并处理“配置非空但 userIds 为空”。
```

示例需导入 `java.util.List` 和上述 DTO。前端字符串 ID 由业务后端严格转换为 `Long`；`nameSnapshot` 不参与解析。现有通用引擎使用 `collectSubjects` 从结构化 `approverSubjects`/`permissionGroupRules[].subjects` 转换，不能只保存显示文本或 `approvers` 字符串就假定该引擎能解析。

当前未提供公共解析 HTTP Controller，也没有公共前后端 DTO 转换端点。需要预览人数的页面应另行设计受控业务接口，不把身份目录和解析器当成公开查询服务。

## 5. 返回语义与异常边界

| 输入或情况 | 当前实际结果 |
| --- | --- |
| `null` / 空集合 | 空 users、空 unresolvedSubjects；不枚举所有人 |
| null 条目、缺 type/id | normalize 直接过滤；调用方须提前严格校验，不能借此静默放开 |
| 完全相同的引用 | 规范化后去重；非部门的 scope 清空 |
| 不存在的用户/部门/角色 | 放入 unresolvedSubjects，不生成该来源用户 |
| 非 ACTIVE 用户 | 从最终用户过滤；直接 USER 引用会记为 unresolved |
| 有效部门/角色没有有效成员 | users 可能为空，但该部门/角色不一定出现在 unresolvedSubjects |
| 同一用户命中多个来源 | users 只返回一条，sources 保存所有命中引用 |
| 数据库查询失败 | 异常向调用方传播，不作为“解析成功但为空” |

当前解析器仅明确过滤用户 `status == ACTIVE`；不能概括成“所有停用主体都会被过滤”，部门/角色没有在这里做同类状态校验。返回列表/Set 顺序不作为业务契约，调用方如需排序须自己处理。

建议新调用方先校验主体类型、ID、部门范围，再调用解析器。解析器是身份展开工具，不是完整输入校验器或授权服务。

## 6. 重复与性能

实现按类型批量查关系：一次汇总涉及的部门 ID 查用户部门关系，一次汇总角色 ID 查用户角色关系；最终按 userId 去重。父子部门重叠不会返回重复用户，也不需要为每个用户创建一项业务任务。

保留父部门和子部门两个来源是有意的：它们可能对应不同默认权限，删除来源会使权限合并失真。解析器来源不含业务权限组 ID；调用方需要保留“组/规则 → 主体引用”映射，不能把来源集合直接当字段权限。

当前每个部门主体仍各自遍历其子树，未实现跨调用缓存或全部重叠子树记忆化；每次读取完整部门目录。批量查询和用户去重不等于成本完全不随数据量增长，超大组织需要测量后优化。

## 7. 何时调用，以及谁负责什么

| 场景 | 调用时机与调用方责任 |
| --- | --- |
| 配置弹窗保存 | 保存主体引用，不冻结人员；可做校验，但校验结果不代替运行解析 |
| 审批任务 | 节点到达/建任务时解析最新成员，保存候选快照；已有任务不因之后组织调整自动重算 |
| 填报字段权限 | 目标为访问/操作时按最新关系判定；最终字段权限服务尚未完整串通 |
| 通知收件人 | 发送时按业务需求解析并去重；空配置不得推导为群发所有人 |
| 预览成员 | 仅展示当次结果，不是将来任务的保证，也不应冻结成正式配置 |

通用 `WorkflowEngine` 已有一条逻辑任务加 `candidateSnapshot` 的实现，包含用户及来源；不是每个候选创建一个独立审批任务。仍有与候选数量有关的快照体积，不应宣称百人/万人解析没有成本。

“主体未配置则开放”属于表单流程调用方规则：使用 `unrestricted` 等业务状态表达，同时校验认证、实例和任务状态。它不是 `SubjectResolver` 的默认规则；已配置但解析为空不能改成 unrestricted。任务建成后的候选冻结，与“每次解析取最新关系”并不冲突。

## 8. 租户和安全边界

当前产品 MVP 按默认单租户使用，多租户是非 MVP TODO。无 tenantId 的重载不会进行租户过滤；带 tenantId 的重载过滤返回实体，但部分查询仍先读全量再筛选，且其存在不代表整套工作流数据隔离完成。不得把该参数当作产品已支持多租户的证据，也不得由不可信前端决定租户归属。

权限、操作主体认证、失效账号校验、任务终态与并发完成仍归业务接口/引擎；选择器里隐藏管理员、解析出某个用户，都不等于这个用户自动获准执行任意动作。

## 9. 核对与接入验收

`original-evidence`：

- [选择器和序列化函数](../../gmp-platform/frontend/src/components/identity/SubjectSelector.tsx)。
- [解析器](../../gmp-platform/backend/src/main/java/com/zencas/edhr/identity/service/SubjectResolver.java)、[主体 DTO](../../gmp-platform/backend/src/main/java/com/zencas/edhr/identity/dto/SubjectReference.java)、[返回 DTO](../../gmp-platform/backend/src/main/java/com/zencas/edhr/identity/dto/SubjectResolution.java)。
- [解析器测试](../../gmp-platform/backend/src/test/java/com/zencas/edhr/identity/service/SubjectResolverTest.java)。
- [工作流调用方](../../gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/engine/WorkflowEngine.java)。

`secondary-reference`：[DEC-0030](../knowledge/decisions/DEC-0030-identity-runtime-subject-resolution.yaml)、[身份规则](../knowledge/rules/identity.yaml)、[DEC-0033](../knowledge/decisions/DEC-0033-form-process-optional-subjects-and-open-operation-scope.yaml)。本文涉及当前行为均以源码复核，不以历史调研摘要替代实现。

接入方最低验收：选择确认/取消；中文名及长 ID 往返；仅本部门/含下级；父子部门与角色交叉去重；保留全部来源；不存在/非 ACTIVE 用户；有效空部门；非法输入；空配置不展开用户；有主体但解析为空；已有任务不被后续组织变化改写。

可执行聚焦检查（仓库根目录进入后端）：

```bash
cd gmp-platform/backend
mvn -Dtest=SubjectResolverTest,WorkflowEngineTest,WorkflowTaskControllerTest test
```

这是回归入口，不是本文声称本轮重新执行过全部测试；本文交付范围为源码对照、文档准确性与链接检查，未做浏览器、大规模性能或多租户 E2E。
