# 文档性能修复：首轮独立质量失败

FINAL：qualityResult.result: failed。受测干净候选 `7d376e81ba32c543d671e11f1503dab28e7760c3`，目标 `31058765002e0705f1659f42abb1fb25b6dc7611`，知识0.3.25。新独立实例未修改产品、测试、知识或夹具，未参与修复。

实际已执行H2及既有后端184/184，0failure/error/skip；核对32主侧原件hash、三产品文件及6个知识ID有限边界。未独立运行PG41、knowledge89、旧基线40或六份执行计划；主侧及本体既有运行不计本实例独立结果。

真实原生PG正常API确认medium `QF-DOCUMENT-UNICODE-FOLD-001`：POST标题“İzmir work instruction”返回200并保留原值；同样关键词“İzmir”GET200却total=0，ASCII“izmir”正向对照total=1。Java ROOT将İ规范为i+组合点；PG en_US.utf8 LOWER规范为i。SQL及独立正常POST/GET原件和探针源码可定位。此为真实检索回归，不是性能数字或夹具失败。

首轮必须failed，发现保持open。主侧已收到原件，将自行修复；最终须由未参与任何修复的全新实例复验，不能由本实例更新为最终passed。

本实例创建的PG容器 `5ec8f3105bd4f9ab673c7a322c21307888ad4bbac06c8965496877b2d793f715` 已精确停止并自动移除（最终按exact ID的docker ps核验为空），未创建工作树，未改共享依赖，主仓仍干净。早期SQL元数据scratch probe使用非GUC lc_ctype曾错误，改查pg_database.datctype后获得根因数据；该工具诊断未作产品结论。

整体审计、A23、其他性能讨论、TaskDetail/生产弹窗/记录控制依赖DHR high/A12及四gap等原边界保持。本报告无merge/deploy/restore或CI/Actions操作。
