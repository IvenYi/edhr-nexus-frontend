# 报表数据集关联配置项右侧选项过滤验证逻辑

## 功能概述

为 `ReportDataSetLinkConfigItem` 组件补充了右侧选项过滤验证逻辑，确保数据集关联配置的正确性。

## 验证规则

### 1. 主从关联 (MASTERSLAVE)
- **要求**: 必须关联同一个子模型
- **验证**: 检查 `bindInfo` 字段是否一致
- **示例**: 左侧选择 `主表.子表字段A`，右侧只能选择关联到相同子表的字段

### 2. 枚举关联 (ENUM, ENUM_MULTI) 
- **要求**: 
  - 枚举模型必须一致
  - 如果设置了自定义枚举值，自定义枚举值必须一致
- **验证**: 
  - 检查 `bindInfo` 字段是否一致（枚举模型）
  - 检查 `specificConfig.customEnumConfig` 配置是否一致
- **示例**: 
  - 左侧选择 `状态字段(枚举A)`，右侧只能选择同样绑定到 `枚举A` 的字段
  - 如果启用了自定义枚举值 `[选项1, 选项2]`，右侧字段也必须有相同的自定义值

### 3. 模型关联 (REF, REF_MULTI)
- **要求**: 必须关联同一个模型
- **验证**: 检查 `bindInfo` 字段是否一致
- **示例**: 左侧选择 `用户字段(关联用户表)`，右侧只能选择同样关联到用户表的字段

### 4. 版本模型关联 (RDO_REF)
- **要求**: 必须关联同一个版本模型  
- **验证**: 检查 `bindInfo` 字段是否一致
- **示例**: 左侧选择 `文档字段(关联文档版本表)`，右侧只能选择同样关联到文档版本表的字段

## 实现细节

### 核心函数

#### `compareArrays(arr1, arr2)`
比较两个数组是否相等，用于验证自定义枚举值。

#### `isCustomEnumConsistent(leftOption, rightOption)`
检查两个枚举字段的自定义枚举配置是否一致：
- 如果都启用了自定义枚举，比较自定义值数组
- 如果都没有启用自定义枚举，认为一致
- 如果一个启用一个未启用，认为不一致

#### `filteredRightOptions` (computed)
主要的过滤逻辑：
1. 基础类型过滤（根据 `fieldTypeMapping` 配置）
2. 特定字段类型的额外验证（bindInfo 一致性检查）
3. 枚举字段的自定义配置验证

### 配置更新

更新了 `fieldTypeMapping` 配置，参考 `transformMappingField4Auto` 函数：
- 使用结构化配置 `{ filterArr: string[], equal?: boolean }`
- 标记需要 `bindInfo` 验证的字段类型（`equal: true`）

## 使用示例

```tsx
<ReportDataSetLinkConfigItem
  index={0}
  items={['leftFieldKey', 'rightFieldKey']}
  leftOptions={[
    {
      value: 'masterSlaveField',
      label: '主从字段',
      type: FIELD_TYPE.MASTERSLAVE,
      bindInfo: 'subModel1' // 子模型ID
    }
  ]}
  rightOptions={[
    {
      value: 'rightField1',
      label: '右侧字段1',
      type: FIELD_TYPE.MASTERSLAVE,
      bindInfo: 'subModel1' // 相同子模型，会显示
    },
    {
      value: 'rightField2', 
      label: '右侧字段2',
      type: FIELD_TYPE.MASTERSLAVE,
      bindInfo: 'subModel2' // 不同子模型，会被过滤
    }
  ]}
  fields={[['leftFieldKey', 'rightFieldKey']]}
  hasError={false}
  @changeLinkField="handleChange"
  @deleteLinkField="handleDelete"
  @clearFieldError="handleClearError"
/>
```

## 测试覆盖

创建了完整的单元测试，覆盖：
- 主从关联字段过滤
- 枚举字段过滤（包括自定义枚举值验证）
- 模型关联字段过滤
- 边界情况处理（无左侧字段选择等）

## 注意事项

1. **向后兼容**: 对于没有配置验证规则的字段类型，保持原有行为
2. **性能优化**: 使用 computed 属性确保只在依赖变化时重新计算
3. **类型安全**: 完整的 TypeScript 类型定义，避免运行时错误
4. **扩展性**: 易于添加新的字段类型验证规则

## 相关文件

- `/packages/runtime-web/src/components/report-data-set-design/widgets/report-data-set-link-config-item.tsx` - 主要实现
- `/src/projects/page-designer/src/schema/field/form/utils.ts` - 参考的 `transformMappingField4Auto` 函数
- `/src/projects/page-designer/src/designer/panels/prop-editor/modals/autofill-rules-modal.vue` - 参考的验证逻辑
