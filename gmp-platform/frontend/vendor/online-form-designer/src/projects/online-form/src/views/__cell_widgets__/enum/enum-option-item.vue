<template>
  <div :class="ns.b()">
    <div :class="ns.b('main')" :key="option.id">
      <div :class="ns.be('main', 'left')">
        <i v-if="!disabled" :class="['iconfont', 'icon-drag', ns.e('icon-drag')]"></i>
        <a-input
          v-model:value="textValue"
          :class="ns.e('text-input')"
          :disabled="disabled"
          :placeholder="$t('sys.inputText')"
        />
      </div>
      <div :class="ns.e('actions')">
        <i
          v-if="!disabled"
          :class="['iconfont', 'icon-bianji', ns.e('edit')]"
          :title="$t('sys.edit')"
          @click="editOption(option)"
        ></i>
        <template v-if="!disabled">
          <SeeViewIcon v-if="option.display" class="icon" @click="hiddenOption(option)" />
          <SeeCloseIcon v-else class="icon" @click="viewOption(option)" />
        </template>
        <i
          v-if="!disabled"
          :class="['iconfont', 'icon-shanchu', ns.e('remove')]"
          :title="$t('sys.delText')"
          @click="removeOption(option)"
        ></i>
        <a-checkbox
          :class="[ns.e('enable'), '!ml-6px']"
          :disabled="disabled"
          v-model:checked="enableRef"
        />
      </div>
    </div>
    <AttachFieldEditor
      v-if="enableRef"
      v-model:items="formState.attachFields"
      :disabled="disabled"
    />
  </div>
</template>

<script lang="ts" setup>
  import { computed, toRef } from 'vue';
  import SeeViewIcon from '/@online-form/views/designer/icons/see-view.vue';
  import SeeCloseIcon from '/@online-form/views/designer/icons/see-close.vue';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import AttachFieldEditor from '../common/attach-fields-editor/attach-fields-editor.vue';
  import { useNamespace } from '@gct/runtime';

  const ns = useNamespace('enum-option-item');

  const props = withDefaults(
    defineProps<{
      option: CellWidget.EnumOption;
      widget: CellWidget.Enum;
      disabled: boolean;
    }>(),
    {},
  );

  const formState = computed({
    get() {
      return props.option;
    },
    set(v) {
      Object.assign(props.option, v);
    },
  });

  const emit = defineEmits<{
    (event: 'edit', option: CellWidget.EnumOption): void;
    (event: 'remove', option: CellWidget.EnumOption): void;
    (event: 'view', option: CellWidget.EnumOption): void;
    (event: 'hidden', option: CellWidget.EnumOption): void;
  }>();

  const enableRef = computed({
    get() {
      return !!formState.value.attachFields;
    },
    set(v) {
      formState.value.attachFields = v ? [] : undefined;
    },
  });

  const textValue = computed({
    get() {
      return formState.value.text;
    },
    set(v) {
      formState.value.text = v;
    },
  });

  const editOption = (option: CellWidget.EnumOption) => {
    emit('edit', option);
  };

  const removeOption = (option: CellWidget.EnumOption) => {
    emit('remove', option);
  };

  const viewOption = (option: CellWidget.EnumOption) => {
    emit('view', option);
  };

  const hiddenOption = (option: CellWidget.EnumOption) => {
    emit('hidden', option);
  };
</script>

<style lang="scss" scoped>
  $enum-option-item: ();

  @include b(enum-option-item) {
    @include set-component-css-var(enum-option-item, $enum-option-item);
    margin-bottom: 4px;

    @include e(text-input) {
      padding: 1px 6px;
      :deep(.ant-input-suffix) {
        display: none;
      }
    }

    @include e(icon-drag) {
      color: #c3c3c3;
      cursor: move;
      margin-right: 4px;
      line-height: 1;
    }

    @include e(actions) {
      display: inline-flex;
      align-items: center;
      color: #797a7d;
      > i {
        line-height: 1;
        width: 16px;
        margin-left: 6px;
        cursor: pointer;
      }
      .icon {
        width: 16px;
        margin-left: 6px;
        cursor: pointer;
      }
    }
  }

  @include b(enum-option-item-main) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px;
    background: #f0f0f0;
    border-radius: 4px;

    @include e(left) {
      flex-grow: 1;
      display: flex;
      align-items: center;
    }
  }
</style>
