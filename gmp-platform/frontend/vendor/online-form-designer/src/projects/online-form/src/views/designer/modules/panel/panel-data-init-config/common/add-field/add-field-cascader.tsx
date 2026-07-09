import { defineComponent, computed, ref, onMounted, nextTick } from 'vue';
import { Cascader, Tooltip } from 'ant-design-vue';
import { isEmpty, has, last } from 'lodash-es';
import { DownOutlined } from '@ant-design/icons-vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { FIELD_TYPE } from '/@/enums/appEnum';

import './AddFieldCascader.less';

import { useField } from './useField';

export default defineComponent({
  name: 'AddFieldCascader',
  props: {
    modelKey: {
      type: String,
    },
    selectValue: {
      type: String,
    },
    isShowCascader: { type: Boolean, default: true },
  },
  emits: ['update:selectValue', 'change'],
  setup(props, { emit, expose }) {
    const { t } = useI18n();

    const { joinModelMetaMap } = useField();

    const visible = ref<boolean>(false);

    const objInfo = computed(() => {
      if (props.modelKey) {
        return joinModelMetaMap.value[props.modelKey];
      }
    });

    const inputValue = computed<string[]>({
      get() {
        if (props.selectValue) {
          return props.selectValue.split('$');
        }

        return [`-:${props.modelKey}`];
      },
      set(value: string[]) {
        emit('update:selectValue', value.join('$'));
      },
    });

    const showCascader = computed(() => {
      return (
        props.isShowCascader &&
        !isEmpty(objInfo.value) &&
        getRefList(objInfo.value.fields).length !== 0
      );
    });

    const tipOptInfo = (label, value) => {
      return {
        label: (
          <div class="field-ops">
            <span class="field-ops-name">{label}</span>
          </div>
        ),
        value: value,
        isLeaf: true,
        disabled: true,
      };
    };

    const getFieldCodeChainStr = (fieldCodeChains) => fieldCodeChains.join(';');

    const getRefList = (list) => {
      return list.filter((item) => [FIELD_TYPE.REF, FIELD_TYPE.RDO_REF].includes(item.fieldType));
    };

    const getLabel = (metaInfo: any, { key, fieldInfo = {}, showIcon }) => {
      if (isEmpty(metaInfo)) return null;

      let name = <span class="field-ops-name">{metaInfo.name}</span>;

      if (!isEmpty(fieldInfo)) {
        name = (
          <span class="field-ops-name">
            {fieldInfo.fieldName}
            <span class="field-ops-desc">（{metaInfo.name}）</span>
          </span>
        );
      }

      return (
        <>
          <div class="field-ops" key={key}>
            {name}
          </div>
          {showIcon && <i class="iconfont icon-a-Rightarrow"></i>}
        </>
      );
    };

    const recursive = (refFieldList, { fieldCodeChains, last = false }) => {
      if (!refFieldList && refFieldList.length === 0) return [];
      return [tipOptInfo(t('sys.component.fieldTransfer.linkModel'), 'link')].concat(
        refFieldList.map((item: any) => {
          const newFieldCodeChains = [...fieldCodeChains, `${item.fieldKey}:${item.bindInfo}`];
          const newFieldCodeChainKey = getFieldCodeChainStr(newFieldCodeChains);
          const refMetaInfo = joinModelMetaMap.value[item.bindInfo];

          const children = !last
            ? recursive(getRefList(refMetaInfo.fields), {
                fieldCodeChains: newFieldCodeChains,
                last: true,
              })
            : [];
          const isShowIcon = children.length >= 2;

          return {
            label: getLabel(refMetaInfo.meta, {
              key: newFieldCodeChainKey,
              fieldInfo: item,
              showIcon: isShowIcon,
            }), // 一条信息是标题
            value: newFieldCodeChainKey,
            isLeaf: false, // ! 解决没有下级内容的时候hover上去需要关闭下级菜单 所以设置成即使当前节点没有 children，也会显示展开图标
            children: isShowIcon ? children : [],
          };
        }),
      );
    };

    const renderOptions = () => {
      let options: any = [];

      if (!isEmpty(objInfo.value)) {
        const mainModelKey = objInfo.value.meta.key;

        const fieldCodeChains = [`-:${mainModelKey}`];
        const fieldCodeChainKey = getFieldCodeChainStr(fieldCodeChains);
        const children = recursive(getRefList(objInfo.value.fields), { fieldCodeChains });
        const isShowIcon = children.length >= 2;

        options = [
          tipOptInfo(t('sys.component.fieldTransfer.currentModel'), 'current'),
          {
            label: getLabel(objInfo.value.meta, { key: fieldCodeChainKey, showIcon: isShowIcon }), // 一条信息是标题
            value: fieldCodeChainKey,
            children: isShowIcon ? children : [],
            isLeaf: false,
          },
        ];
      }
      return options;
    };

    const renderSelectName = () => {
      let fieldName = <span />;
      let posInfoList: any = [];
      let name = '';
      let lastName;

      if (inputValue.value && inputValue.value.length > 0 && !isEmpty(objInfo.value)) {
        const lastPos = last(inputValue.value);
        if (lastPos) {
          const posList = lastPos.split(';');
          posInfoList = posList
            .map((pos, index) => {
              const [fieldKey, bindModelKey] = pos.split(':');

              const refMetaInfo = joinModelMetaMap.value[bindModelKey];

              if (fieldKey === '-') {
                return {
                  bindModelKey,
                  title: refMetaInfo.meta.name,
                };
              }

              const belongPos = posList?.[index - 1];
              const [_, belongModelKey] = belongPos.split(':');
              const belongMetaInfo = joinModelMetaMap.value[belongModelKey];

              const fieldInfo = belongMetaInfo.fields.find((i) => i.fieldKey === fieldKey);
              if (fieldInfo) {
                return {
                  bindModelKey,
                  title: `${fieldInfo.fieldName}(${refMetaInfo.meta.name})`,
                };
              }
              return;
            })
            .filter((i) => i);
        }
        const _posInfoList = posInfoList.slice(1);
        lastName = _posInfoList.map((info, index) => {
          return (
            <Tooltip title={t('sys.model.modelKey') + '：' + info.bindModelKey}>
              <span class="last-name">{`${info.title}  ${
                index !== _posInfoList.length - 1 ? '/' : ''
              }  `}</span>
            </Tooltip>
          );
        });

        name = `${posInfoList?.[0]?.title}  ${_posInfoList.length !== 0 ? '/' : ''}  `;
      }

      fieldName = (
        <span>
          <span class="bread">
            <span class="field-cascader-title">
              {t('sys.component.fieldTransfer.soModelTitle')}
            </span>
            {name}
          </span>
          {lastName}
          {showCascader.value && <DownOutlined class="ml-4px down-icon" />}
        </span>
      );

      return fieldName;
    };

    return {
      visible,
      showCascader,
      inputValue,
      renderOptions,
      renderSelectName,
      t,
    };
  },
  render() {
    return (
      <div class="add-field-cascader" style={{ cursor: this.showCascader ? 'pointer' : 'default' }}>
        <Cascader
          dropdownClassName="add-field-popup-cascader"
          options={this.renderOptions()}
          v-model:value={this.inputValue}
          expandTrigger="hover"
          onDropdownVisibleChange={(v) => (this.visible = v)}
          open={this.showCascader ? this.visible : false}
          changeOnSelect
        >
          <div>{this.renderSelectName()} </div>
        </Cascader>
      </div>
    );
  },
});
