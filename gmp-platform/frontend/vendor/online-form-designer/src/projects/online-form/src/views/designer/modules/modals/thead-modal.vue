<template>
  <a-form
    class="important-pt-24px"
    ref="formRef"
    :model="formState"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 16 }"
  >
    <a-form-item
      :label="$t('sys.onlineForm.headerName')"
      name="name"
      :rules="[
        {
          required: true,
          message: t('sys.pleaseInputSth', { sth: t('sys.onlineForm.headerName') }),
          whitespace: true,
        },
      ]"
    >
      <a-input v-model:value="formState.name" show-count :maxlength="32" />
    </a-form-item>

    <a-form-item :label="$t('sys.onlineForm.startPosition')">
      <span>{{ range.from }}</span>
      <span>-</span>
      <span>{{ range.to }}</span>
    </a-form-item>

    <a-form-item name="mode" :label="$t('sys.onlineForm.paginationRendering')">
      <a-radio-group v-model:value="formState.mode" name="radioGroup">
        <a-radio value="1" :disabled="mode1Disabled">{{ $t('sys.appDesigner.global') }}</a-radio>
        <a-radio value="2">{{ $t('sys.onlineForm.subTableType.DEFAULT') }}</a-radio>
        <!-- <a-radio value="3">{{ $t('sys.onlineForm.subTableType.FIXED') }}</a-radio> -->
      </a-radio-group>
    </a-form-item>

    <a-form-item
      v-if="formState.mode === '2'"
      :label="$t('sys.onlineForm.subTableType.DEFAULT')"
      name="tableId"
      :rules="[{ required: true }]"
    >
      <a-select v-model:value="formState.tableId">
        <a-select-option v-for="item in availableDynTables" :key="item.id" :value="item.id">{{
          item.name
        }}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item
      v-if="formState.mode === '3'"
      :label="$t('sys.onlineForm.subTableType.FIXED')"
      name="tableId"
      :rules="[{ required: true }]"
    >
      <a-select v-model:value="formState.tableId">
        <a-select-option v-for="item in availableFixedTables" :key="item.id" :value="item.id">{{
          item.name
        }}</a-select-option>
      </a-select>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
  import { ref, inject, reactive, computed, watch } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { num2Col } from '/@online-form/views/designer/utils';

  const { t } = useI18n();
  const { selection, paper } = useSpreadSheet();

  const range = computed(() => {
    const { t, l, r, b } = selection;
    return {
      from: `${num2Col(l)}${t}`,
      to: `${num2Col(r)}${b}`,
    };
  });

  const formRef = ref<FormInstance>();
  const formState: {
    name?: string;
    mode?: '1' | '2' | '3';
    tableId?: string;
  } = reactive({});
  const mode1Disabled = ref<boolean>(false);

  (() => {
    if (selection.l === 1 && selection.r === paper.value.cols.length) {
      formState.mode = '1';
    } else {
      formState.mode = '2';
      mode1Disabled.value = true;
    }
  })();

  watch(
    () => formState.mode,
    (value) => {
      if (value === '1') {
        formState.tableId = undefined;
      }
    },
    {
      immediate: true,
    },
  );

  const getAvailableTables = (list) => {
    const targetTable = list
      ?.toSorted((a, b) => a.range.t - b.range.t)
      .find(
        (item) =>
          item.range.t > selection.b && !(item.range.r < selection.l || item.range.l > selection.r),
      );
    if (targetTable && targetTable.range.l === selection.l && targetTable.range.r === selection.r) {
      return [targetTable];
    } else {
      return [];
    }
  };

  /**
   * 可绑定的子表判断 只会有一个
   * 1.排序
   * 2.选区以下的有交叉的第一个子表（表头子表之间不允许存在其他子表）
   * 3.判断区域是否一致
   * 4.判断是否有表头
   */
  const availableDynTables = computed(() => {
    return getAvailableTables(paper.value.dynamicTables ?? []);
  });

  const availableFixedTables = computed(() => {
    return getAvailableTables(paper.value.fixedTables ?? []);
  });

  const modal = inject<any>('modal');
  modal.ok = async () => {
    try {
      await formRef.value?.validate();
      const result = {
        ok: true,
        data: {
          ...formState,
        },
      };
      return result;
    } catch (err) {
      console.warn(err);
    }
  };
</script>

<style></style>
