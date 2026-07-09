<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="modalTitle || t('sys.component.fieldTransfer.defaultModalTitle')"
    centered
    :canFullscreen="false"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    :getContainer="getContainer"
    @visible-change="handleShow"
  >
    <div class="field-transfer-container">
      <a-spin :spinning="!isLoad">
        <div class="h26px leading-26px bg-[#3168EC]/[0.1] pl-10px mb10px" v-if="promptMessage">
          <i class="iconfont icon-guanyu text-[#3168EC]"></i>
          <span class="text-[#666] ml6px">{{ promptMessage }}</span>
        </div>
        <FieldCascader
          class="mb-8px"
          :isShowCascader="isShowCascader"
          :scope="SCOPEINFO.FIELD_LIST"
        />
        <FieldTransfer
          :titles="titles"
          :maxEnableCount="maxEnableCount"
          :draggable="draggable"
          :disabled-field-key="disabledFieldKey"
          :containFieldKey="containFieldKey"
          :containFieldType="containFieldType"
          :excludeFieldKey="excludeFieldKey"
          :containCreateType="containCreateType"
          :excludeFieldType="excludeFieldType"
          :filterFieldByFunction="filterFieldByFunction"
          :objFields="isLoad ? selectObj : {}"
          :value="objFieldList"
          :onChange="setObjFieldList"
        />
      </a-spin>
    </div>
  </basic-modal>
</template>

<script setup lang="ts" name="field-transfer-modal">
  import { ref, onBeforeMount, toRaw, watch } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';

  import { pick, isEmpty } from 'lodash-es';
  import { useModelField } from '../hooks/useModelField';
  import FieldCascader from './Cascader/FieldCascader';
  import FieldTransfer from './Transfer/FieldTransfer';

  import { FIELD_TYPE, CreateType } from '/@/enums/appEnum';
  import { SCOPEINFO } from '../utils/enum';

  export interface Prop {
    /** 模型key */
    modelKey: string;
    /** 是否显示级联选择 */
    isShowCascader?: boolean;
    /** 弹框标题 */
    modalTitle?: string;
    /** 选中的字段数组 */
    data?: any[];
    /** 穿梭框标题集合 */
    titles?: string[];
    /** 包含的字段 */
    containFieldType?: FIELD_TYPE[];
    /** 包含的字段Key */
    containFieldKey?: string[];
    /** 禁用的字段 */
    disabledFieldKey?: string[];
    /** 排除的字段key */
    excludeFieldKey?: string[];
    /** 排除的字段 */
    excludeFieldType?: FIELD_TYPE[];
    /**包含的字段创建类型 */
    containCreateType?: CreateType[];
    /**自定义过滤函数 */
    filterFieldByFunction?: (field) => boolean;
    /** 最大选择个数 */
    maxEnableCount?: number;
    modalKey?: string;
    /** 是否支持拖拽 */
    draggable?: boolean;
    /**
     * 子表的关联主键字段的父模型字段
     */
    childParentModelKey?: string;
    destroyCallback?: () => void;
    saveCallback?: (params: Recordable<any>) => void;
    promptMessage?: String;
  }

  const { t } = useI18n();

  const [registerInner, { closeModal }] = useModalInner();

  const props = withDefaults(defineProps<Prop>(), {
    draggable: true,
  });

  const getContainer = () => document.querySelector(`#${props.modalKey}`);

  const {
    loadObjInfo,
    modelFieldMap,
    getModelFieldInfo,
    clearSelectInfo,
    clearObjInfo,
    selectObj,
  } = useModelField(SCOPEINFO.FIELD_LIST);

  const objFieldList = ref<any[]>([]);
  const isLoad = ref<boolean>(false);

  onBeforeMount(async () => {
    objFieldList.value = [];
    clearSelectInfo();
    clearObjInfo();
    if (props.modelKey) {
      isLoad.value = await loadObjInfo(props.modelKey, {
        isShowCascader: props.isShowCascader,
        childParentModelKey: props.childParentModelKey,
      });
    }
  });

  watch(
    [() => props.data, () => modelFieldMap.value, isLoad],
    () => {
      if (!isEmpty(modelFieldMap.value)) {
        objFieldList.value =
          props.data
            ?.map((item) => {
              const obj = pick(item, [
                'bindFieldKey',
                'isFieldModel',
                'modelKey',
                'fieldCodeChain',
                'key',
                'field',
                'disabled',
              ]);
              const fieldInfo = getModelFieldInfo(obj.modelKey, obj.field || obj.key);

              if (fieldInfo) {
                return {
                  ...fieldInfo,
                  bindFieldKey: obj.bindFieldKey,
                  isFieldModel: obj.isFieldModel || false,
                  disabled: obj.disabled || false,
                  fieldCodeChain:
                    obj.fieldCodeChain ?? JSON.stringify({ modelKey: fieldInfo.modelKey }),
                };
              }
            })
            .filter((i) => i) ?? [];
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const setObjFieldList = (list) => {
    objFieldList.value = list;
  };

  const handleShow = async (visible: boolean) => {
    if (visible) {
      // 初始化
      // console.log('handleShow visible', visible);
      // userList.value = (await getTenantDeveloperList()) ?? [];
    }
  };

  const handleClose = () => {
    objFieldList.value = [];
    clearSelectInfo();
    clearObjInfo();
    isLoad.value = false;
    if (props.destroyCallback && typeof props.destroyCallback === 'function') {
      props.destroyCallback();
    }
  };

  const handleOk = async () => {
    if (props.saveCallback && typeof props.saveCallback === 'function') {
      const params = {
        objFieldList: toRaw(objFieldList.value),
      };
      props.saveCallback(params);
    }
    closeModal();
  };
</script>

<style lang="less" scoped>
  .field-transfer-container {
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>
