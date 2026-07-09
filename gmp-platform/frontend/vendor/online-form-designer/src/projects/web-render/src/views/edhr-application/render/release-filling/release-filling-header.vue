<template>
  <div class="release-filling-header-wrapper">
    <a-form ref="formRef" :model="formState" autocomplete="off">
      <a-row :gutter="[16, 24]">
        <a-col :span="8">
          <a-form-item name="materialNo" :label="t('sys.edhr.lotOrSn')">
            <MaterialNoAutocomplete v-model:value="formState.materialNo" @enter="handleSearch" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <div class="filling-query">
            <a-button style="margin-right: 8px" type="primary" @click="handleSearch">
              <template #icon>
                <search-outlined />
              </template>
              {{ t('sys.queryText') }}
            </a-button>

            <div class="filling-help">
              <QuestionCircleFilled />
              <span>{{ t('sys.webRender.edhrApplication.releaseFillingHelp') }}</span>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script setup lang="ts" name="release-filling-header">
  import { ref, reactive } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useReleaseFill } from '/@online-form/views/integration/apaas_ebr/index';
  import MaterialNoAutocomplete from '/@web-render/views/edhr-application/components/material-no-autocomplete/material-no-autocomplete.vue';

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      value?: string;
      loading?: boolean;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value?: string): void;
    (e: 'update:loading', value?: boolean): void;
  }>();

  const formRef = ref<FormInstance>();

  const formState = reactive<{
    /** 物料编号 */
    materialNo?: string;
  }>({
    materialNo: undefined,
  });

  const { releaseFill } = useReleaseFill(props, emit);

  function handleSearch() {
    formRef.value
      ?.validate()
      .then(releaseFill)
      .then((res: any) => {
        if (res) {
          emit('update:value', res);
        }
      });
  }
</script>

<style scoped lang="less">
  .release-filling-header-wrapper {
    padding: 16px 16px 0 16px;

    .filling-query {
      display: flex;
      align-items: center;
      .filling-help {
        margin-left: 4px;
        line-height: 22px;
        display: flex;
        align-items: center;
        .anticon {
          color: #f90;
          font-size: 16px;
          margin-right: 4px;
        }
      }
    }
  }
</style>
