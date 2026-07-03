<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.pageDesigner.checkModelFields')"
    centered
    width="800px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <div class="check-field w-720px">
      <div v-if="!isModelCheck" class="check-field__header mb-10px">
        <div class="select-box flex justify-between items-center">
          <span>{{ t('sys.chooseText') + '：' }}</span>
          <a-select
            showSearch
            optionFilterProp="name"
            v-model:value="checkModelKey"
            @change="handleCheckChange"
            :placeholder="t('sys.chooseText')"
            class="flex-1"
          >
            <a-select-opt-group v-for="models in categoryModels" :key="models.id">
              <template #label>
                <span>
                  {{ models.name }}
                </span>
              </template>
              <a-select-option
                :key="model.id"
                v-for="model in models.children"
                :value="model.id"
                :name="model.name"
                >{{ model.name }}</a-select-option
              >
            </a-select-opt-group>
            <!-- <a-select-option v-for="item in categoryModels" :value="item.id" :key="item.id">{{
              item.name
            }}</a-select-option> -->
          </a-select>
        </div>
      </div>
      <div class="check-field__content">
        <a-transfer
          v-model:target-keys="targetKeys"
          v-model:selected-keys="selectedKeys"
          :data-source="dataSource"
          :titles="[
            t('sys.component.fieldTransfer.noSelect'),
            t('sys.component.fieldTransfer.select'),
          ]"
          :list-style="{
            // width: '300px',
            height: '400px',
          }"
          :filter-option="filterOption"
          @change="handleChange"
          @selectChange="handleSelectChange"
        >
          <template #render="item">
            <div class="render-item flex flex-col">
              <div class="render-item__title">
                <div class="name flex">
                  <span class="name" :title="item.name">{{ item.name }}</span>

                  <span class="render-item__key" :title="item.key">{{ item.key }}</span>
                </div>

                <span class="field-type" :title="t('sys.pageDesigner.fieldCmp.' + item.type)">
                  {{ t('sys.pageDesigner.fieldCmp.' + item.type) }}
                </span>
              </div>
            </div>
          </template>
        </a-transfer>
      </div>
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FIELD_TYPE, CreateType } from '/@/enums/appEnum';
  import { ModelTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { CategoryCompleteResponse, FieldAttribute, FieldMetaDTO } from '/@/apis/gct-apaas/model';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';

  const { t } = useI18n();
  const emit = defineEmits(['refresh', 'register', 'ok']);
  // defineProps<Props>();
  const checkModelKey = ref();
  const targetKeys = ref<string[]>([]);
  const dataSource = ref<any[]>([]);
  const selectedKeys = ref<string[]>([]);
  const categoryModels = ref<CategoryCompleteResponse[]>([]);
  const fieldConfig = ref<FieldAttribute[]>([]);
  const checkItems = ref<FieldMetaDTO[]>([]);
  const isModelCheck = ref<boolean>(false);
  const excludeFieldType = [
    FIELD_TYPE.EXPRESSION,
    FIELD_TYPE.AGG,
    FIELD_TYPE.LABEL_TEMPLATE,
    FIELD_TYPE.SERIAL,
    FIELD_TYPE.EXPRESSION_CONDITION,
  ];

  const [registerInner, { closeModal }] = useModalInner(async (data) => {
    if (data) {
      fieldConfig.value = data.fieldConfig;
      if (data.isModelCheck) {
        isModelCheck.value = data.isModelCheck;
        await handleCheckChange(data.modelKey);
        targetKeys.value = [...data.checkKeys];
      }
    }
  });

  onMounted(() => {
    !isModelCheck.value && useModelFields();
  });

  const useModelFields = async () => {
    const res = await getCategoryListComplete({
      module: ModelTypeEnum.ENTITY as string,
    });
    categoryModels.value =
      res
        ?.map((c) => ({
          ...c,
          children: c.children?.filter((i) => i.type !== 'TXN_EXT') ?? [],
        }))
        .filter((c) => c.children.length > 0) ?? [];
  };

  const handleCheckChange = async (val) => {
    const res =
      (await getFieldMetaList({
        modelKey: val,
        sys: true,
      })) || [];
    dataSource.value = res
      .filter((item) => !excludeFieldType.includes(item.type))
      .filter((v) => [CreateType.BUILTIN, CreateType.USER_DEFINED].includes(v.createType));
    targetKeys.value = [];
  };

  const filterOption = (inputValue: string, option: any) => {
    return option.description.indexOf(inputValue) > -1;
  };

  const handleChange = (keys: string[], direction: string, moveKeys: string[]) => {
    console.log(keys, direction, moveKeys);
    const map: Record<string, any> = {};
    dataSource.value.forEach((item) => {
      map[item.key] = item;
    });
    checkItems.value = keys.map((key) => map[key]);
  };

  const handleSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    console.log('sourceSelectedKeys: ', sourceSelectedKeys);
    console.log('targetSelectedKeys: ', targetSelectedKeys);
  };

  const handleClose = () => {
    isModelCheck.value = false;
    checkModelKey.value = undefined;
    dataSource.value = [];
    targetKeys.value = [];
    checkItems.value = [];
    selectedKeys.value = [];
  };

  const handleOk = async () => {
    emit('ok', checkItems.value);
  };
</script>

<style lang="less" scoped>
  .check-field {
    margin: 0 auto;

    .render-item {
      &__title {
        display: flex;
        justify-content: space-between;
        width: 100%;

        .name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .field-type {
          display: inline-block;
          margin-right: 10px;
          margin-left: 10px;
          padding: 0 6px;
          border-radius: 2px;
          background-color: #f8f9fa;
          color: #999;
          font-size: 12px;
        }
      }

      &__key {
        overflow: hidden;
        color: #777;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &__content {
      padding: 12px;
      border: 1px solid #e8ebf0;

      :deep(.ant-transfer-list) {
        flex: 1;

        .ant-transfer-list-content {
          padding: 0 12px;

          .ant-transfer-list-content-item {
            padding-right: 0;
            padding-left: 0;
            border-bottom: 1px solid #e8ebf0;

            &:last-of-type {
              border-bottom: none;
            }
          }
        }

        .ant-transfer-list-header {
          background-color: #f7f8fa;
        }
      }
    }
  }
</style>
