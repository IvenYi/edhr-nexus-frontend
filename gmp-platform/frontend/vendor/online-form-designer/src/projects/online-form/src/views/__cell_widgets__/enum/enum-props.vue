<template>
  <form-item :label="`${t('sys.pageDesigner.fieldPlaceholder')}`" :inline="false">
    <a-input
      size="small"
      v-model:value="formState.placeholder"
      :placeholder="t('sys.inputText')"
      :disabled="disabled"
      show-count
      :maxlength="32"
    />
  </form-item>
  <form-item :inline="false">
    <template #label>
      <div class="enum-props-title">
        <span> {{ `${t('sys.component.fieldTypeProps.enumOption')}` }} </span>
        <div class="flex">
          <div
            v-if="!disabled"
            class="flex items-center primary-gct cursor-pointer"
            @click="handleOpenImportModal"
          >
            <EnumImportIcon />
            <span class="ml-4px">{{ $t('sys.synchronous') }}</span>
          </div>
          <div
            v-if="!disabled"
            class="flex items-center ml-16px primary-gct cursor-pointer"
            @click="addOption"
          >
            <EnumAddIcon />
            <span class="ml-4px">{{ $t('sys.insert') }}</span>
          </div>
        </div>
      </div>
    </template>
    <vue-draggable
      v-model="formState.options"
      :animation="200"
      ghost-class="ghost"
      :handle="`.gct-enum-option-item__icon-drag`"
    >
      <template #item="{ element: option }">
        <EnumOptionItem
          :option="option"
          :widget="widget"
          :key="option.id"
          :disabled="disabled"
          @edit="editOption"
          @remove="removeOption"
          @view="viewOption"
          @hidden="hiddenOption"
        />
      </template>
    </vue-draggable>
  </form-item>
  <enum-option-modal @register="register" @create="onOptionCreate" @update="onOptionUpdate" />
  <enum-import-modal @register="importRegister" @import-enum="onImportEnum" />
</template>

<script setup lang="ts">
  import { useModal } from '/@/components/Modal';
  import VueDraggable from 'vuedraggable';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import EnumOptionModal from './enum-option-modal.vue';
  import EnumImportModal from './enum-import-modal.vue';

  import EnumImportIcon from '/@online-form/views/designer/icons/enum-import.vue';
  import EnumAddIcon from '/@online-form/views/designer/icons/enum-add.vue';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import { computed } from 'vue';
  import { differenceBy } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import EnumOptionItem from './enum-option-item.vue';

  const { t } = useI18n();

  const [register, { openModal }] = useModal();

  const [importRegister, { openModal: openImportModal }] = useModal();

  const props = defineProps<{
    widget: CellWidget.Enum;
    fieldType: FIELD_TYPE;
    disabled: boolean;
  }>();

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  const addOption = () => {
    openModal(true, { isEdit: false });
  };

  const editOption = (option: CellWidget.EnumOption) => {
    openModal(true, { isEdit: true, option });
  };

  const removeOption = (option: CellWidget.EnumOption) => {
    const findIndex = formState.value.options.findIndex((item) => item.id === option.id);
    formState.value.options.splice(findIndex, 1);
  };

  const viewOption = (option: CellWidget.EnumOption) => {
    formState.value.options.forEach((item) => {
      if (item.id === option.id) {
        item.display = true;
      }
    });
  };

  const hiddenOption = (option: CellWidget.EnumOption) => {
    formState.value.options.forEach((item) => {
      if (item.id === option.id) {
        item.display = false;
      }
    });
  };

  const afterOptionChange = (option: CellWidget.EnumOption) => {
    // 如果是枚举单选，设置默认值之后把其他选项的默认值设置为false
    if (
      (props.fieldType === FIELD_TYPE.ENUM || props.fieldType === FIELD_TYPE.OPTION) &&
      option.defaultSelected
    ) {
      formState.value.options.forEach((item) => {
        if (item.id !== option.id) {
          item.defaultSelected = false;
        }
      });
    }
  };

  const onOptionUpdate = (option: CellWidget.EnumOption) => {
    const findIndex = formState.value.options.findIndex((item) => item.id === option.id);
    formState.value.options.splice(findIndex, 1, option);
    afterOptionChange(option);
  };

  const onOptionCreate = (option: CellWidget.EnumOption) => {
    formState.value.options.push(option);
    afterOptionChange(option);
  };

  const handleOpenImportModal = () => {
    openImportModal(true, {});
  };

  const onImportEnum = (res) => {
    const itemsToAdd = differenceBy(res, formState.value.options, 'value');

    if (itemsToAdd && itemsToAdd.length) {
      const add = itemsToAdd.map((item: any) => {
        return {
          id: item.id,
          text: item.text,
          value: item.value,
          defaultSelected: false,
          display: true,
          attachFields: undefined,
        };
      });
      formState.value.options.push(...add);
    }
  };
</script>

<style lang="less" scoped>
  .enum-props-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
