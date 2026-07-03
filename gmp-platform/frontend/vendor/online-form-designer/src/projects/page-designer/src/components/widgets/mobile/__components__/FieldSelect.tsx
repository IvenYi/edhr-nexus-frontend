import { defineComponent, ref, computed, inject } from 'vue';
import { Cell, Popup, Picker } from 'vant';
import type { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { FormComponents } from '/@page-designer/enum';
import { FIELD_TYPE } from '/@/enums/appEnum';
import Taglabel from './taglabel.vue';
import { EntityModelTypeEnum } from '@/projects/app-designer/src/enum';
import OptionList from '/@page-designer/components/widgets/mobile/__components__/listPopup/src/optionList.vue';

export default defineComponent({
  name: 'FieldSelect',
  props: {
    design: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    showPop: Boolean,
    fieldType: {
      type: String as PropType<FIELD_TYPE>,
      required: true,
    },
    type: {
      type: Object as PropType<FormComponents>,
      required: true,
    },
    tagStyle: {
      type: Object as PropType<LowCodeWidget.BasicStyle>,
      required: true,
    },
    isLinkageMode: {
      type: Boolean,
    },
    options: Array,
    value: [String, Number, Boolean],
    multiple: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '请选择',
    },
    refModelType: {
      type: String,
      default: '',
    },
    /** 是否寄生开关组件 */
    useSwitchComp: {
      type: Boolean,
      default: false,
    },
    maxTagTextLength: {
      type: Number,
      default: 12,
    }
  },
  setup(props, { emit }) {
    const layout: any = inject('form-layout', {});
    const options = computed(() => {
      return (props.options ?? []).map((item: any) => {
        return {
          ...item,
        };
      });
    });

    function getLabels(item: any) {
      const arr = item._item?.full_path_.split('/') || [];
      const labels = (props.options ?? [])
        .filter((i) => arr.includes(i.value))
        .map((val: any) => val.label);
      return labels.join('/');
    }

    const selectInfo = computed(() => {
      return (
        options.value?.filter((item) => {
          if (props.multiple) {
            return props.value?.includes(item.value);
          }
          return props.value === item.value;
        }) ?? []
      );
    });
    const slots = {
      value: () => {
        if (
          props.value?.length ||
          (['boolean', 'enum'].includes(props.fieldType) &&
            !(props.value === undefined || props.value === ''))
        ) {
          const iconExts = {};
          const avatarProps = {};
          const labelArr: any[] = [];
          // console.log('selectInfo--------', selectInfo.value);
          selectInfo.value.forEach((e) => {
            const label = handleLabel(e.label);
            const { icon, iconColor, textColor } = e._item || {};
            iconExts[label] = { icon, iconColor, textColor };
            if (props.fieldType === FIELD_TYPE.USER_MULTI || props.fieldType === FIELD_TYPE.USER) {
              avatarProps[label] = { avatar: e._item?.avatar };
            }
            labelArr.push(
              props.refModelType === EntityModelTypeEnum.TREE && !props.isLinkageMode
                ? getLabels(e)
                : label
            );
          });
          return (
            <Taglabel
              class="mr-4px"
              tagWidgetStyle={props.tagStyle}
              type={props.fieldType}
              label={labelArr}
              disabled={props.disabled}
              iconExtraProps={iconExts}
              avatarProps={avatarProps}
            />
          );
        } else {
          return (
            <Taglabel
              type={props.fieldType}
              disabled={props.disabled}
              label={!props.readonly ? props.placeholder : ''}
              style={{
                color: 'var(--van-gray-5)',
                paddingRight: layout?.value?.inputBg ? '12px' : '',
                fontSize: '14px',
              }}
            />
          );
        }
      },
    };

    const pickerSlots = {
      option: (option) => {
        return (
          <Taglabel
            tagWidgetStyle={props.tagStyle}
            type={props.fieldType}
            label={option.label}
            disabled={props.disabled}
            showTagStyle={false}
          />
        );
      },
    };

    const onConfirm = ({ selectedOptions }) => {
      emit('confirm', selectedOptions[0].value);
      emit('update:value', selectedOptions[0].value);
      emit('update:showPop', false);
    };

    const onCancel = () => {
      emit('update:showPop', false);
    };

    const onChecked = (value: any) => {
      emit('update:value', value.value);
      emit('checked', value.value);
      emit('update:showPop', false);
    };

    const handleLabel = (label) => {
      if (props.readonly) {
        return label;
      }
      if (label.length > props.maxTagTextLength) {
        return label.slice(0, props.maxTagTextLength) + '...';
      }
      return label;
    };

    return () => {
      if (props.design) {
        return (
          <Cell is-link={!props.readonly} v-slots={slots} border={false} style={{ padding: 0 }} />
        );
      }
      return (
        <>
          <Cell
            class="app-tag-cell-box"
            is-link={!props.readonly}
            v-slots={slots}
            border={false}
            style={{ padding: 0, background: 'transparent' }}
          />
          <Popup
            v-model:show={props.showPop}
            position="bottom"
            round
            teleport="body"
            onClickOverlay={onCancel}
            style={props.useSwitchComp ? { height: '60%' } : {}}
          >
            {props.useSwitchComp ? (
              props.showPop ? (
                <OptionList
                  type={'single'}
                  options={props.options || []}
                  fieldType={FIELD_TYPE.REF}
                  activeKey={props.value ?? ''}
                  title={'请选择'}
                  onChecked={onChecked}
                />
              ) : null
            ) : (
              <Picker
                columns={props.options || []}
                columnsFieldNames={{
                  text: 'label',
                  value: 'value',
                }}
                v-slots={pickerSlots}
                onConfirm={onConfirm}
                onCancel={onCancel}
              />
            )}
          </Popup>
        </>
      );
    };
  },
});
