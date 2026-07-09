<template>
  <div>
    <a-row :gutter="24">
      <a-col :span="8">
        <a-form-item label="工单名称">
          <a-select style="width: 100%" :placeholder="t('sys.chooseText')" />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item label="批次名称" required>
          <a-select style="width: 100%" :placeholder="t('sys.chooseText')" />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item>
          <a-button class="mr-10px">{{ t('sys.reset') }}</a-button>
          <a-button class="mr-10px" type="primary">{{ t('sys.query') }}</a-button>
          <a-button v-if="print" type="primary">{{ t('sys.print') }}</a-button>
        </a-form-item>
      </a-col>
    </a-row>
    <div
      class="relative grid grid-cols-6 gap-2 p-2 results-field-container"
      :style="{ 'grid-template-columns': `repeat(6, 1fr)` }"
    >
      <div v-for="field in containerColumns" :key="field.key">
        <span>{{ field.title }}:</span>
      </div>
    </div>
    <div style="background-color: #fbfbfc">
      <a-table
        v-if="modulesList?.includes('passingStation')"
        :dataSource="[]"
        :columns="passingStationColumns"
        :pagination="false"
        class="mt-10px"
      />
      <a-table
        v-if="modulesList?.includes('check')"
        :dataSource="[]"
        :columns="checkColumns"
        :pagination="false"
        class="mt-10px"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-edhr-se">
  import { toRefs } from 'vue';
  import { IEDhrSE } from './schema';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { containerColumns, checkColumns, passingStationColumns } from './type';

  const { t } = useI18n();

  const props = defineProps<{
    widget: IEDhrSE;
  }>();

  const { print, modulesList } = toRefs(props.widget.props);

  defineExpose({});
</script>
<style scoped lang="less">
  .results-field-container {
    background: #f7f8fa;
    border-radius: 4px;

    .results-field__trigger {
      position: absolute;
      z-index: 20;
      right: 10px;
      top: 8px;
      color: var(--ant-primary-color);
    }
  }
</style>
