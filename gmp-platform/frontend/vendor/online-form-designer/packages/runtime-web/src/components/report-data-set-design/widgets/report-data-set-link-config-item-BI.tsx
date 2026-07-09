import { computed, defineComponent, toRefs } from 'vue';
import { useNamespace } from '@gct-paas/core';
import './report-data-set-link-config-item.scss';
import { BIFieldTypeEnum } from '/@/projects/bi-designer/src/views/data-set/interface/type';

/**
 * 报表数据集关联配置项组件
 *
 * 功能：提供左右两侧字段的关联配置，支持智能过滤验证
 *
 * 右侧选项过滤验证逻辑：
 * 1. 主从关联 (MASTERSLAVE)：必须关联同一个子模型 (bindInfo 一致)
 * 2. 枚举关联 (ENUM, ENUM_MULTI)：
 *    - 枚举模型必须一致 (bindInfo 一致)
 *    - 如果设置了自定义枚举值，自定义枚举值必须一致
 * 3. 模型关联 (REF, REF_MULTI)：必须关联同一个模型 (bindInfo 一致)
 * 4. 版本模型关联 (RDO_REF)：必须关联同一个版本模型 (bindInfo 一致)
 */

export const ReportDataSetLinkConfigItemBI = defineComponent({
  name: 'ReportDataSetLinkConfigItem',
  props: {
    index: {
      type: Number,
      required: true,
    },
    items: {
      type: Array<string>,
      required: true,
    },
    leftOptions: {
      type: Array<IObject>,
      default: () => [],
    },
    rightOptions: {
      type: Array<IObject>,
      default: () => [],
    },
    fields: {
      type: Array<string[]>,
      required: true,
    },
    hasError: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['changeLinkField', 'deleteLinkField', 'clearFieldError'],
  setup(props, { emit }) {
    const t = (window as any).$t;
    const ns = useNamespace('report-data-set-link-config-item');

    const { items, leftOptions, rightOptions, fields, hasError } = toRefs(props);

    // 字段类型映射配置，根据左侧选择的类型筛选右侧可选项
    // 基于 transformMappingField4Auto 函数的配置，其中 equal: true 的字段类型需要额外的 bindInfo 验证
    interface FieldMappingConfig {
      filterArr: string[];
      equal?: boolean;
    }

    const fieldTypeMapping: Record<string, FieldMappingConfig> = {
      [BIFieldTypeEnum.TEXT]: {
        filterArr: [BIFieldTypeEnum.TEXT, BIFieldTypeEnum.IMG],
      },
      [BIFieldTypeEnum.NUMBER]: {
        filterArr: [BIFieldTypeEnum.NUMBER],
      },
      [BIFieldTypeEnum.DATE]: {
        filterArr: [BIFieldTypeEnum.DATE],
      },
      [BIFieldTypeEnum.IMG]: {
        filterArr: [BIFieldTypeEnum.IMG, BIFieldTypeEnum.TEXT],
      },
    };

    const key = computed<string>(() => {
      return (items.value[0] || '') + (items.value[1] || '');
    });

    const onChangeLinkField = () => {
      emit('changeLinkField', items.value);
    };

    const onDeleteLinkField = () => {
      emit('deleteLinkField', props.index);
    };

    /**
     * 处理左侧字段变化
     * @param value - 选择的值
     */
    const onLeftFieldChange = (value: string) => {
      items.value[0] = value;
      // 清空右侧选择，因为左侧字段类型变化了
      items.value[1] = null as any;
      // 如果有值，则尝试清除错误状态
      if (value) {
        emit('clearFieldError', props.index, 'left');
      }
      onChangeLinkField();
    };

    /**
     * 处理右侧字段变化
     * @param value - 选择的值
     */
    const onRightFieldChange = (value: string) => {
      items.value[1] = value;
      // 如果有值，则尝试清除错误状态
      if (value) {
        emit('clearFieldError', props.index, 'right');
      }
      onChangeLinkField();
    };

    /**
     * 检查左侧字段是否为空
     */
    const leftFieldEmpty = computed<boolean>(() => {
      return hasError.value && !items.value[0];
    });

    /**
     * 检查右侧字段是否为空
     */
    const rightFieldEmpty = computed<boolean>(() => {
      return hasError.value && !items.value[1];
    });

    /**
     * 根据 fieldTypeMapping 的 key 过滤左侧可选项
     */
    const filteredLeftOptions = computed(() => {
      // 获取 fieldTypeMapping 中所有支持的字段类型（key）
      const supportedTypes = Object.keys(fieldTypeMapping);

      // 只显示在映射配置中存在的字段类型
      return leftOptions.value.filter((option) => supportedTypes.includes(option.type));
    });

    /**
     * 比较两个数组是否相等
     */
    const compareArrays = (arr1: any[], arr2: any[]) => {
      if (!arr1 || !arr2) return false;
      return arr1.toString() === arr2.toString();
    };

    /**
     * 检查自定义枚举配置是否一致
     */
    const isCustomEnumConsistent = (leftOption: any, rightOption: any) => {
      const leftCustomConfig = leftOption.specificConfig?.customEnumConfig;
      const rightCustomConfig = rightOption.specificConfig?.customEnumConfig;

      // 检查是否都启用了自定义枚举配置
      const leftEnabled = leftCustomConfig?.enabled;
      const rightEnabled = rightCustomConfig?.enabled;

      if (leftEnabled && rightEnabled) {
        // 都启用了自定义枚举，需要比较自定义值是否一致
        return compareArrays(leftCustomConfig.values, rightCustomConfig.values);
      } else if (!leftEnabled && !rightEnabled) {
        // 都没有启用自定义枚举，认为一致
        return true;
      } else {
        // 一个启用了自定义枚举，一个没有，不一致
        return false;
      }
    };

    /**
     * 根据左侧选择的字段类型过滤右侧可选项
     */
    const filteredRightOptions = computed(() => {
      if (!items.value[0]) {
        return rightOptions.value;
      }

      // 获取左侧选择的字段信息
      const selectedLeftOption = leftOptions.value.find(
        (option) => option.value === items.value[0],
      );
      if (!selectedLeftOption || !selectedLeftOption.type) {
        return rightOptions.value;
      }

      const leftFieldType = selectedLeftOption.type;
      const fieldConfig = fieldTypeMapping[leftFieldType] || [];

      // 如果没有配置映射关系，则不可选择
      if (!fieldConfig) {
        return [];
      }

      // 基础类型过滤
      const filteredList = rightOptions.value.filter((option) => {
        return fieldConfig.filterArr.includes(option.type);
      });

      return filteredList;
    });

    /**
     * 根据输入过滤选项
     */
    const filterOption = (input: string, option: any) => {
      return option.label.toLowerCase().includes(input.toLowerCase());
    };

    return () => {
      return (
        <div key={key.value} class={[ns.b(), ns.is('has-error', hasError.value == true)]}>
          <div class={ns.e('item-config')}>
            <div class={ns.em('item-config', 'select')}>
              <a-select
                v-model:value={items.value[0]}
                placeholder={t('sys.dataSet.pleaseSelect')}
                class={leftFieldEmpty.value ? ns.e('select-error') : null}
                onChange={onLeftFieldChange}
                showSearch={true}
                allowClear
                filterOption={filterOption}
              >
                {filteredLeftOptions.value.map((option) => (
                  <a-select-option
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    title={option.label}
                  >
                    <span class={ns.e('option-title')}>{option.label}</span>
                  </a-select-option>
                ))}
              </a-select>
              {leftFieldEmpty.value && <div class={ns.em('item-config', 'error')}>{t('sys.dataSet.pleaseSelectField')}</div>}
            </div>
            <div class={ns.em('item-config', 'equal')}>=</div>
            <div class={ns.em('item-config', 'select')}>
              <a-select
                v-model:value={items.value[1]}
                placeholder={t('sys.dataSet.pleaseSelect')}
                class={rightFieldEmpty.value ? ns.e('select-error') : null}
                onChange={onRightFieldChange}
                showSearch={true}
                allowClear
                filterOption={filterOption}
              >
                {filteredRightOptions.value.map((option) => (
                  <a-select-option
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    title={option.label}
                  >
                    <span class={ns.e('option-title')}>{option.label}</span>
                  </a-select-option>
                ))}
              </a-select>
              {rightFieldEmpty.value && <div class={ns.em('item-config', 'error')}>{t('sys.dataSet.pleaseSelectField')}</div>}
            </div>
          </div>
          {fields.value.length > 1 ? (
            <div class={ns.e('item-delete')} onClick={onDeleteLinkField}>
              <a-tooltip title={t('sys.dataSet.deleteTooltip')}>
                <i class="iconfont icon-shanchu" />
              </a-tooltip>
            </div>
          ) : null}
        </div>
      );
    };
  },
});
