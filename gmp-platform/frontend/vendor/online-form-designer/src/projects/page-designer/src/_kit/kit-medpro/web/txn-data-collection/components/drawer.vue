<template>
  <a-drawer
    v-model:visible="drawerVisible"
    :title="drawerTitle"
    placement="right"
    :closable="false"
    width="60%"
    @close="onClose"
    class="txt-data-collection-drawer"
  >
    <!-- :maskStyle="{ backgroundColor: 'transparent' }" -->
    <template #extra>
      <close-outlined
        style="font-size: 16px; margin-left: 12px; color: inherit"
        class="api-icon"
        @click.stop="onClose"
      />
    </template>
    <div class="mb-16px flex">
      <SvgIcon class="mr-8px" :size="24" :name="typeParser(collectionItem)" />
      <span class="drawer-title">{{ collectionItem.name || '数据采集' }}</span>
    </div>
    <a-form :model="dcData" ref="formRef">
      <a-table :data-source="dcData" :columns="rightCols">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.key === 'type_'">
            {{ t(`sys.pageDesigner.dynamicFormType.${record.type_}`) }}
          </template>
          <template v-if="column.key === 'value_'">
            <dynamic-value
              v-model="record.value_"
              :readonly="isReadonly || widget.props.readonly"
              :formData="record"
              :index="record.index"
              :key="record.randomKey"
            />
          </template>
          <template v-if="column.key === 'tip_text_'">
            {{ record.tip_text_ }}
          </template>
        </template>
      </a-table>
    </a-form>
    <template v-if="!isReadonly" #footer>
      <a-popconfirm
        title="数据将会被重置修改，是否确认重置?"
        ok-text="是"
        cancel-text="否"
        @confirm="handleReset"
      >
        <a-button>重置</a-button>
      </a-popconfirm>
      <a-button
        type="primary"
        style="margin-left: 8px"
        @click="handleTemporary"
        :loading="temporaryLoading"
        >保存</a-button
      >
      <a-button
        type="primary"
        style="margin-left: 8px"
        @click="handleSubmit"
        :loading="submitLoading"
        >提交</a-button
      >
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FormInstance, message } from 'ant-design-vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import DynamicValue from '../dynamic-value.vue';
  import { CollectionData, rightCols, typeParser, TypeNames, StatusEnum } from '../types';
  import { SvgIcon } from '/@/components/Icon';

  const props = defineProps<{
    collectionItem: CollectionData;
    widget;
  }>();

  const emit = defineEmits(['handleLoad']);

  const { t } = useI18n();
  const Event = getPageEvent();

  const drawerVisible = ref<boolean>(false);
  const formRef = ref<FormInstance>();
  const temporaryLoading = ref<boolean>(false);
  const submitLoading = ref<boolean>(false);
  const dcData = ref<any>([]);

  const drawerTitle = computed(() => TypeNames[props.collectionItem?.type] || '数据采集');

  const isReadonly = computed(() => props.collectionItem?.status === StatusEnum.SUBMITTED);

  const getCollectionData = async () => {
    const res =
      (await Event.context.$customBizService.post(
        {
          action: 'biz_get_data_collection_details',
          key: 'em_data_collection_task',
        },
        {
          id_: props.collectionItem.id,
        },
      )) || [];
    dcData.value = res.map((d) => {
      d.randomKey = Math.random();
      return d;
    });
    Event.runEventByName('onDetailOpened', props.widget.events, dcData.value);
  };

  const onOpen = async (id) => {
    drawerVisible.value = true;
    getCollectionData();
  };

  const onClose = () => {
    drawerVisible.value = false;
    dcData.value = [];
  };

  /** 暂存数据采集数据到暂存表 */
  async function handleTemporary() {
    try {
      temporaryLoading.value = true;
      await Event.context.$customBizService.post(
        {
          action: 'biz_data_collection_stash',
          key: 'em_data_collection_task',
        },
        {
          id_: props.collectionItem.id,
          entries_: dcData.value,
        },
      );
      message.success('保存成功');
      emit('handleLoad');
    } catch (e) {
      message.warning('保存失败');
    }
    temporaryLoading.value = false;
  }

  async function handleSubmit() {
    await formRef.value?.validate();
    try {
      submitLoading.value = true;
      await Event.context.$customBizService.post(
        {
          action: 'biz_data_collection_submit',
          key: 'em_data_collection_task',
        },
        {
          id_: props.collectionItem.id,
          entries_: dcData.value,
        },
      );
      message.success('提交成功');
      drawerVisible.value = false;
      emit('handleLoad');
    } catch (e) {
      message.warning('提交失败');
    }
    submitLoading.value = false;
  }

  async function validate() {
    try {
      await formRef.value?.validate();
    } catch {
      throw message.warning('当前数据采集未通过校验');
    }
  }

  /** 重置回暂存/初始数据状态 */
  async function handleReset() {
    await getCollectionData();
  }

  defineExpose({ onOpen, onClose, validate });
</script>

<style lang="scss" scoped>
  .drawer-title {
    line-height: 24px;
  }
  :global(.txt-data-collection-drawer .ant-drawer-header) {
    padding: 16px;
  }
  :global(.txt-data-collection-drawer .ant-drawer-body) {
    flex: 1;
    display: flex !important;
    flex-direction: column !important;
    padding: 16px;
    background: #f7f8fa;
  }
  :global(.txt-data-collection-drawer .ant-drawer-footer) {
    padding: 15px 16px;
    text-align: right;
  }
</style>
