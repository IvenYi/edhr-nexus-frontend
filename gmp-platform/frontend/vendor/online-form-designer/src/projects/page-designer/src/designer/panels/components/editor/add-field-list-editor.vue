<template>
  <div>
    <a-button @click="addFiled" block style="line-height: 1">
      {{ $t('sys.pageDesigner.selectModelFields') }}
    </a-button></div
  >
  <div class="content-center mt10px">
    <draggable
      :list="valueList"
      handle=".cursor-move"
      :animation="200"
      chosen-class="drawing-chosen"
      drag-class="drawing-drag"
      item-key="id"
    >
      <template #item="{ element, index }">
        <div class="ks-row-middle fieldrow mb5px">
          <span
            class="icon-drag iconfont ml10px mr5px cursor-move text-[#999] primary-gct-hover"
          ></span>
          <span
            class="iconfont mr6px primary-gct"
            :class="FieldIconMap[element.type] || 'icon-zidingyi'"
          ></span>
          <a-tooltip>
            <template #title>{{ element.name }}</template>
            <div class="ks-col ell"> {{ element.name }}</div>
          </a-tooltip>

          <a-popconfirm
            placement="topLeft"
            :title="$t('sys.pageDesigner.areYouSureToDelete')"
            @confirm="deleteList(index)"
          >
            <a-tooltip title="删除">
              <span
                class="icon-shanchu iconfont mr5px cursor-pointer text-[#999] error-gct-hover"
              ></span
            ></a-tooltip>
          </a-popconfirm>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue';
  import draggable from 'vuedraggable';
  import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { FIELD_TYPE, CreateType, FieldIconMap } from '@/enums/appEnum';
  import { useFieldTransfer } from '/@/components/FieldTransfer';
  const Fieldinstance = useFieldTransfer();
  const defProps = defineProps<{
    modelValue: any[];
    modelKey: any;
    excludeFieldType?: FIELD_TYPE[];
  }>();
  const emit = defineEmits(['update:modelValue']);
  const valueList = computed<any[]>({
    get() {
      return defProps.modelValue || [];
    },
    set(value) {
      emit('update:modelValue', value || []);
    },
  });
  const fieldList = ref<FieldMetaDTO[]>([]);
  const excludeFieldType = defProps.excludeFieldType || [
    FIELD_TYPE.ESOP,
    FIELD_TYPE.MASTERSLAVE,
    FIELD_TYPE.LABEL_TEMPLATE,
    FIELD_TYPE.SERIALRULE,
  ];
  getFieldList();
  async function getFieldList() {
    let list = (await getFieldMetaList({ modelKey: defProps.modelKey })) || [];
    fieldList.value = list;
  }

  function addFiled() {
    Fieldinstance.open({
      modelKey: defProps.modelKey,
      modalTitle: $t('sys.pageDesigner.selectModelFields'),
      isShowCascader: false,
      data: valueList.value,
      draggable: false,
      excludeFieldType: excludeFieldType,
      excludeFieldKey: ['id_'],
      containCreateType: [CreateType.BUILTIN, CreateType.USER_DEFINED],
      promptMessage: $t('sys.pageDesigner.excludeMessage'),
      saveCallback: ({ objFieldList }) => {
        valueList.value = [...objFieldList];
      },
    });
  }
  function deleteList(index) {
    valueList.value.splice(index, 1);
  }
</script>

<style lang="less" scoped>
  .fieldrow {
    height: 32px;
    padding: 4px 8px;
    border-radius: 4px;
    background-color: #f2f4f7;
  }

  .content-center {
    & > div {
      max-height: 370px;
      overflow: auto;
    }
  }
</style>
