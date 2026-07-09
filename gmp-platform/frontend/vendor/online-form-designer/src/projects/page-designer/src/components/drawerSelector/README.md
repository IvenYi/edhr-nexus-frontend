# Pad端人员和组织选择组件

## 概述

本组件集合为 pad 端应用提供人员和组织选择功能，支持单选、多选、搜索等功能。

## 组件结构

```
drawerSelector/
├── components/
│   ├── org-select/           # 组织选择组件
│   │   ├── org-select.tsx    # 主要逻辑
│   │   └── org-select.scss   # 样式文件
│   ├── user-select/          # 人员选择组件
│   │   ├── user-select.tsx   # 主要逻辑
│   │   └── user-select.scss  # 样式文件
│   └── index.ts             # 统一导出
├── template.vue             # 使用模板
└── types.ts                # 类型定义
```

## 功能特性

### 组织选择 (OrgSelect)

- ✅ **层级导航**: 支持树形结构的组织层级钻取
- ✅ **面包屑导航**: 显示当前位置并支持快速返回上级
- ✅ **搜索功能**: 支持按组织名称搜索
- ✅ **选择模式**: 支持单选和多选
- ✅ **分页加载**: 使用 VanList 实现无限滚动
- ✅ **响应式设计**: 适配 pad 端 44px 行高标准

### 人员选择 (UserSelect)

- ✅ **头像显示**: 显示用户头像或默认头像
- ✅ **基本信息**: 显示姓名和其他用户信息
- ✅ **搜索功能**: 支持按用户名搜索
- ✅ **选择模式**: 支持单选和多选
- ✅ **分页加载**: 使用 VanList 实现无限滚动
- ✅ **响应式设计**: 适配 pad 端设计规范

## 技术实现

### 技术栈

- **Vue 3**: 使用 Composition API
- **TypeScript**: 完整的类型支持
- **JSX**: 灵活的组件渲染
- **Vant**: 移动端 UI 组件库
- **SCSS**: BEM 方法论样式
- **@gct-paas/core**: 样式系统和命名空间

### 核心功能

#### 组织选择逻辑

```typescript
// 层级钻取
const drillDown = (org: Option) => {
  breadcrumb.value.push(org);
  // 加载子级组织数据
};

// 面包屑导航
const renderBreadcrumb = () => {
  return breadcrumb.value.map((item, index) => (
    <span key={item.value} onClick={() => navigateToLevel(index)}>
      {item.label}
    </span>
  ));
};
```

#### 人员选择逻辑

```typescript
// 渲染用户列表
const renderUserList = () => {
  return filteredOptions.value.map((user) => (
    <div key={user.value} class={bem('item')}>
      <img
        src={user.avatar || defaultAvatar}
        class={bem('avatar')}
      />
      <span class={bem('name')}>{user.label}</span>
    </div>
  ));
};
```

### 样式系统

使用 BEM 方法论和 CSS 自定义属性：

```scss
.gct-org-select {
  // 面包屑样式
  &__breadcrumb {
    padding: 12px 16px;
    border-bottom: 1px solid var(--van-border-color);
  }

  // 列表项样式 - 44px 行高
  &__item {
    height: 44px;
    display: flex;
    align-items: center;
    padding: 0 16px;
  }

  // 钻取区域
  &__drill {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
  }
}
```

## 使用方法

### 基础用法

```vue
<template>
  <div>
    <!-- 组织选择 -->
    <OrgSelect
      :multiple="true"
      :options="orgOptions"
      @select="handleOrgSelect"
    />

    <!-- 人员选择 -->
    <UserSelect
      :multiple="false"
      :options="userOptions"
      @select="handleUserSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { OrgSelect, UserSelect } from './components';

const handleOrgSelect = (selected: Option[]) => {
  console.log('选中的组织:', selected);
};

const handleUserSelect = (selected: Option) => {
  console.log('选中的用户:', selected);
};
</script>
```

### Props 接口

```typescript
interface Props {
  multiple?: boolean;        // 是否多选，默认 false
  options: Option[];        // 选项数据
  searchPlaceholder?: string; // 搜索框占位符
  emptyText?: string;       // 空数据提示
  getOptions?: (params: any) => Promise<{options: Option[], total: number}>;
}

interface Option {
  label: string;           // 显示文本
  value: string | number;  // 选项值
  children?: Option[];     // 子选项（组织选择用）
  avatar?: string;         // 头像URL（人员选择用）
  disabled?: boolean;      // 是否禁用
}
```

## 开发规范

### 文件组织

- 每个组件不超过 500 行代码
- 样式文件与组件文件分离
- 使用统一的导出文件 `index.ts`

### 代码规范

- 使用 ESLint + Prettier 格式化
- 遵循 Vue 3 + TypeScript 最佳实践
- 组件名使用 PascalCase
- 事件名使用 camelCase

### 样式规范

- 使用 BEM 命名方法
- 遵循 44px 行高设计标准
- 使用 CSS 自定义属性实现主题适配
- 响应式设计适配不同屏幕尺寸

## 构建和部署

```bash
# 开发模式
pnpm dev

# 构建 page-designer 项目
pnpm build:page-designer

# 代码检查和格式化
pnpm lint:eslint
pnpm lint:prettier
```

## 注意事项

1. **依赖版本**: 确保 Vue 3、Vant、@gct-paas/core 版本兼容
2. **图标资源**: 组织选择组件使用内联 SVG 图标
3. **数据格式**: 严格按照 Option 接口提供数据
4. **性能优化**: 大量数据时建议使用虚拟滚动
5. **无障碍访问**: 支持键盘导航和屏幕阅读器

## 更新日志

- **v1.0.0** (2024-01-15): 初始版本，实现基础的组织和人员选择功能
- 支持单选、多选模式
- 支持搜索和分页
- 完整的 TypeScript 类型支持
- 响应式设计和 BEM 样式规范
