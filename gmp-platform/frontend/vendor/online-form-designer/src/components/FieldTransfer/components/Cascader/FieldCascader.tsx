import { defineComponent, ref, computed } from 'vue';
import { Cascader, Tooltip } from 'ant-design-vue';
import { useModelField } from '../../hooks/useModelField';
import { isEmpty, has } from 'lodash-es';
import { DownOutlined } from '@ant-design/icons-vue';
import { useI18n } from '/@/hooks/web/useI18n';
import '../../less/FieldCascader.less';
import { CreateType, FIELD_TYPE } from '/@/enums/appEnum';
import { SCOPEINFO } from '../../utils/enum';
export default defineComponent({
  name: 'FieldCascader',
  props: {
    scope: {
      type: String as PropType<SCOPEINFO>,
      default: SCOPEINFO.FIELD_FORM,
    },
    isShowCascader: { type: Boolean, default: true },
  },
  setup(props) {
    const { t } = useI18n();
    const {
      fieldCascaderSelectValue,
      objInfo,
      getModelInfo,
      getModelFieldInfo,
      fetchDetailList,
      changeSelectInfo,
    } = useModelField(props.scope);
    const visible = ref<boolean>(false);

    const isReadyonly = computed(() => {
      return !props.isShowCascader || objInfo.value.relateObjList.length === 0;
    });

    const handleClickItem = async (e: any, item: any) => {
      // e.stopPropagation();
      visible.value = false;
      const key = has(item, 'fieldKey') ? item.bindModelKey : item.modelKey;
      await fetchDetailList(key);
      changeSelectInfo(key, item);
    };

    const renderOptions = () => {
      const label = (item: any, showIcon = false) => {
        const modelInfo = getModelInfo(item.bindModelKey || item.modelKey);
        if (modelInfo) {
          let name = <span class="field-ops-name">{modelInfo.modelName}</span>;
          if (item.belongModelKey && item.fieldKey !== 'ref_master_id_') {
            const fieldInfo = getModelFieldInfo(item.belongModelKey, item.fieldKey);
            if (fieldInfo) {
              name = (
                <span class="field-ops-name">
                  {fieldInfo.name}
                  <span class="field-ops-desc">（{modelInfo.modelName}）</span>
                </span>
              );
            }
          }
          return (
            <>
              <div
                class="field-ops"
                // onMouseEnter={(e) => handleMouseEnter(e, item)}
                onClick={(e) => handleClickItem(e, item)}
              >
                {name}
              </div>
              {showIcon && <i class="iconfont icon-a-Rightarrow"></i>}
            </>
          );
        }

        return null;
      };

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

      let options: any = [];
      if (!isEmpty(objInfo.value)) {
        const recursive = (fieldItem) => {
          if (!fieldItem.relateObjList) return [];
          return [tipOptInfo(t('sys.component.fieldTransfer.linkModel'), 'link')].concat(
            fieldItem.relateObjList
              .filter((item) => FIELD_TYPE.ASSOCIATED_PRIMARY_KEY !== item.fieldType)
              .map((item: any) => {
                const isShowIcon = item.children.length !== 0;
                return {
                  label: label(item, isShowIcon),
                  value: item.fieldCodeChain,
                  isLeaf: false, // ! 解决没有下级内容的时候hover上去需要关闭下级菜单 所以设置成即使当前节点没有 children，也会显示展开图标
                  children: isShowIcon
                    ? [tipOptInfo(t('sys.component.fieldTransfer.linkModel'), 'link')].concat(
                        item.children.map((i) => {
                          return {
                            label: label(i),
                            value: i.fieldCodeChain,
                          };
                        }),
                      )
                    : [],
                };
              }),
          );
        };

        const mainModelList = objInfo.value.relateObjList?.filter(
          (item) => FIELD_TYPE.ASSOCIATED_PRIMARY_KEY === item.fieldType,
        );
        let subMainOpts: any = [];
        if (mainModelList.length) {
          subMainOpts = [
            tipOptInfo(t('sys.component.fieldTransfer.subMainModel'), 'submain'),
          ].concat(
            mainModelList.map((item) => ({
              label: label(item),
              value: item.fieldCodeChain,
            })) as any[],
          );
        }
        const children = recursive(objInfo.value);

        options.push(tipOptInfo(t('sys.component.fieldTransfer.currentModel'), 'current'));
        options.push({
          label: label(objInfo.value, children.length >= 2), // 一条信息是标题
          value: objInfo.value.fieldCodeChain,
          children: children.length >= 2 ? children : [],
          isLeaf: false,
        });
        options.push(...subMainOpts);
      }
      return options;
    };

    const renderSelectName = () => {
      let fieldName = <span />;
      let name = '';
      let lastName = '';
      if (fieldCascaderSelectValue.value && fieldCascaderSelectValue.value.length > 0) {
        fieldCascaderSelectValue.value.forEach((pos) => {
          const fieldCodeChainObj = JSON.parse(pos);
          if (has(fieldCodeChainObj, 'bindFieldKey')) {
            const belongModelInfo = getModelInfo(fieldCodeChainObj.belongModelKey);

            const fieldInfo = getModelFieldInfo(
              fieldCodeChainObj.belongModelKey,
              fieldCodeChainObj.bindFieldKey,
            );
            const bindModelInfo = getModelInfo(fieldCodeChainObj.bindModelKey);
            // console.log(fieldInfo, belongModelInfo, bindModelInfo);
            if (belongModelInfo && fieldInfo && bindModelInfo) {
              if (fieldInfo.key !== 'ref_master_id_') {
                name += `${belongModelInfo.modelName}  /  `;
              }
              if (fieldInfo.type === FIELD_TYPE.ASSOCIATED_PRIMARY_KEY) {
                lastName = bindModelInfo.modelName;
              } else {
                lastName = `${fieldInfo.name}(${bindModelInfo.modelName})`;
              }
            }
          } else {
            const modelInfo = getModelInfo(fieldCodeChainObj.modelKey);
            if (modelInfo) {
              lastName = modelInfo.modelName;
            }
          }
        });
      } else if (objInfo.value.modelKey) {
        const fieldCodeChainObj = JSON.parse(objInfo.value.fieldCodeChain);
        const modelInfo = getModelInfo(fieldCodeChainObj.modelKey);
        if (modelInfo) {
          lastName = modelInfo.modelName;
        }
      }
      fieldName = (
        <span>
          <span class="bread">
            <span class="field-cascader-title">
              {t('sys.component.fieldTransfer.soModelTitle')}
            </span>
            {name}
          </span>
          <Tooltip title={t('sys.model.modelKey') + '：' + objInfo.value.modelKey}>
            <span class="last-name">{lastName}</span>
          </Tooltip>
          {!isReadyonly.value && <DownOutlined class="ml-4px down-icon" />}
        </span>
      );
      return fieldName;
    };

    return () => {
      return (
        <div class="field-cascader" style={{ cursor: isReadyonly.value ? 'default' : 'pointer' }}>
          <Cascader
            dropdownClassName="field-popup-cascader"
            options={renderOptions()}
            v-model:value={fieldCascaderSelectValue.value}
            expandTrigger="hover"
            onDropdownVisibleChange={(v) => {
              visible.value = v;
            }}
            open={isReadyonly.value ? false : visible.value}
            changeOnSelect
          >
            <div>{renderSelectName()} </div>
          </Cascader>
        </div>
      );
    };
  },
});
