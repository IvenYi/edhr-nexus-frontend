import { defineComponent, computed, h } from 'vue';
import type { PropType } from 'vue';
import { Select, Avatar, Empty } from 'ant-design-vue';
import type { SelectProps } from 'ant-design-vue';
import type { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { FIELD_TYPE } from '/@/enums/appEnum';
import { FormComponents } from '/@page-designer/enum';
import FieldReadonly from './field-readonly.vue';
import SelectTag from './field-label/selectTag.vue';
import Taglabel from './field-label/taglabel.vue';
import { pick } from 'lodash-es';
import './index.less';
import './FieldSelect.less';
import { transformUrl } from '/@/components/Cropper/hooks/useFile';
import { truncateText, measureText } from '@gct/runtime';
import { typePadding } from '../../../hooks/useTag';

interface ISelectExtraProps {
  mode?: 'multiple' | undefined;
  placeholder?: string;
  optionLabelProp?: string | undefined;
  allowClear?: boolean;
  showSearch?: boolean;
  optionNoStyle?: boolean;
  emptyText?: string;
}

export default defineComponent({
  name: 'FieldSelect',
  components: { Avatar },
  props: {
    design: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    selectExtraProps: Object as PropType<ISelectExtraProps>,
    fieldType: {
      type: String as PropType<FIELD_TYPE>,
      required: true,
    },
    type: {
      type: String as PropType<FormComponents>,
      required: true,
    },
    tagStyle: {
      type: Object as PropType<LowCodeWidget.BasicStyle>,
      required: true,
    },
    options: Array as PropType<SelectProps['options']>,
    value: [String, Number],
    maxTagCount: {
      type: [Number, String],
      default: 5,
    },
    maxTagTextLength: {
      type: Number,
      default: 6,
    },
    selectOptionLabel: {
      //模型关联自定义下拉框显示字段
      type: String,
    },
    selectorWidth: {
      type: Number,
      default: 1400,
    },
  },
  setup(props, { emit }) {
    const currentValue = computed({
      get() {
        return props.value;
      },
      set(value) {
        emit('update:value', value);
      },
    });

    const renderTag = (com, { name, iconExtraProps, otherParams = {} }) => {
      return h(com, {
        tagWidgetStyle: props.tagStyle,
        type: props.fieldType,
        label: name,
        disabled: props.disabled,
        iconExtraProps: iconExtraProps,
        ...otherParams,
      });
    };
    const renderSelectTag = ({ name, title, iconExtraProps, avatar, otherParams = {} }) => {
      return (
        <SelectTag
          tagWidgetStyle={props.tagStyle}
          type={props.fieldType}
          label={name}
          avatar={avatar}
          title={
            title?.length > props.maxTagTextLength || measureText(title) > measureText(name)
              ? title
              : null
          }
          disabled={props.disabled}
          iconExtraProps={iconExtraProps}
          {...otherParams}
        />
      );
    };
    const options = computed<SelectProps['options']>(() => {
      return (props.options ?? []).map((item) => {
        const { iconColor, icon, textColor } = item._item || {};
        return {
          ...item,
          [props.selectExtraProps?.optionLabelProp || 'titleLabel']: renderTag(Taglabel, {
            name: item.label,
            iconExtraProps: { [item.label]: { icon, iconColor, textColor } },
          }),
        };
      });
    });
    function getLabelByDict(item = {}, key) {
      const { _DICT = {} } = item;
      const value = item[key];
      return _DICT[key]?.[value]?.join('，') ?? value ?? item.id_;
    }
    const selectInfo = computed(() => {
      if (props.readonly) {
        const list =
          options.value?.filter((item) => {
            if (props.selectExtraProps?.mode === 'multiple') {
              return currentValue.value?.includes(item.value);
            }
            return item.value === currentValue.value;
          }) ?? [];

        const icons = Object.fromEntries(
          list?.map((item) => {
            return [item.label, pick(item?._item || {}, ['iconColor', 'icon', 'textColor'])];
          }) ?? [],
        );
        return {
          labels: list.map((e) => e.label),
          icons,
        };
      }
      return {};
    });

    const slot = {
      option: (data) => {
        const { label, _item = {} } = data;
        if (props.type === FormComponents.Userpicker) {
          return (
            <div class="flex items-center">
              <Avatar
                size={30}
                style="margin: 0 8px;min-width:32px"
                src={transformUrl(_item.avatar)}
              />
              <div style="width:calc(100% - 35px)">
                <div class=" w100% ell" title={label}>
                  {label}
                </div>
                <div class="text-[#8F8F8F] text-[12px] mt2px">{_item.masterOrgName}</div>
              </div>
            </div>
          );
        } else {
          const name = props.selectOptionLabel
            ? getLabelByDict(_item, props.selectOptionLabel)
            : label;
          return renderTag(Taglabel, {
            name,
            iconExtraProps: { [label]: pick(_item, ['iconColor', 'icon', 'textColor']) },
            otherParams: {
              showTagStyle: false,
            },
          });
        }
      },
      notFoundContent: props.selectExtraProps?.emptyText
        ? () => {
            return (
              <Empty
                description={props.selectExtraProps?.emptyText || $t('sys.noData')}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style="margin: 12px 0"
              />
            );
          }
        : undefined,
    };

    const tagRender = (data) => {
      const { label, option, closable, onClose } = data;
      const { _item = {} } = option || {};
      return renderSelectTag({
        name: truncateText(
          label.slice(0, props.maxTagTextLength + 3),
          props.selectorWidth - typePadding(option || data),
        ),
        title: option?.label,
        avatar: props.selectorWidth > 73 ? option?._item?.avatar : '',
        iconExtraProps: { [label]: pick(_item, ['iconColor', 'icon', 'textColor']) },
        otherParams: {
          closable,
          'onOn-close': onClose,
          style: 'margin-right: 3px',
        },
      });
    };

    return () => {
      return props.readonly ? (
        renderTag(FieldReadonly, {
          name: selectInfo.value?.labels,
          iconExtraProps: selectInfo.value?.icons,
        })
      ) : (
        <Select
          class={['field-select', 'w100%']}
          v-model:value={currentValue.value}
          options={options.value}
          disabled={props.disabled}
          v-slots={props.selectExtraProps?.optionNoStyle ? null : slot}
          optionLabelProp="titleLabel"
          tagRender={tagRender}
          showArrow
          maxTagCount={props.maxTagCount}
          maxTagTextLength={props.maxTagTextLength}
          dropdownMatchSelectWidth={180}
          dropdownClassName={
            props.selectExtraProps?.mode === 'multiple'
              ? 'gct-project-select-dropdown gct-project-select-multiple vxe-table--ignore-clear'
              : 'gct-project-select-dropdown vxe-table--ignore-clear'
          }
          {...props.selectExtraProps}
        />
      );
    };
  },
});
