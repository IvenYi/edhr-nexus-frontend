<template>
  <div class="fields-editor">
    <template v-if="formState.formFields">
      <div class="fields-editor__item" v-for="(field, index) in formState.formFields" :key="index">
        <FormFieldSelect class="fields-editor__item-select" v-model="formState.formFields[index]" />
        <div
          :title="$t('sys.edhr.delete')"
          class="fields-editor__item-remove"
          @click="removeField(index)"
        >
          -
        </div>
      </div>
    </template>
    <template v-if="!formState.formFields">
      <FormFieldSelect v-model="formState.formField" />
    </template>
    <template v-if="allowMultiple">
      <a-button type="dashed" class="fields-editor__add-button" size="small" @click="addField">
        <i class="iconfont icon-pad_icon_add_blue"></i>
        {{ $t('sys.add') }}
      </a-button>
      <div class="fields-editor__write-mode" v-if="formState.formFields">
        <form-item :inline="false" :label="$t('sys.edhr.writeBackMode')" required>
          <a-radio-group v-model:value="formState.writeBackMode">
            <a-radio :value="DeviceLink.WriteBackModeEnum.ROUTINE">{{
              $t('sys.edhr.routine')
            }}</a-radio>
            <a-radio :value="DeviceLink.WriteBackModeEnum.MOUSE_FOCUS">{{
              $t('sys.edhr.MouseFocus')
            }}</a-radio>
          </a-radio-group>
        </form-item>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup name="fields-editor">
  import { DeviceLink } from '@gct/nocode-base';
  import { FormFieldSelect } from '/@online-form/components/form-field';
  import { reactive, computed, watch, onMounted, ref } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';

  const props = withDefaults(
    defineProps<{
      map: DeviceLink.Device2FormFieldMap;
    }>(),
    {},
  );

  const formState = computed({
    get() {
      return props.map;
    },
    set(v) {
      Object.assign(props.map, v);
    },
  });

  /** 布尔值不允许添加多个 */
  const allowMultiple = computed(() => {
    return props.map.deviceLinkParams?.type !== 'Boolean';
  });

  const addField = () => {
    console.log('addField');

    if (!formState.value.formFields) {
      formState.value.formFields = [formState.value.formField!];
      formState.value.writeBackMode = DeviceLink.WriteBackModeEnum.ROUTINE;
      formState.value.formField = undefined;
    }
    formState.value.formFields.push(undefined);
  };

  const removeField = (index: number) => {
    formState.value.formFields?.splice(index, 1);
    if (formState.value.formFields?.length === 1) {
      formState.value.formField = formState.value.formFields[0];
      formState.value.formFields = undefined;
    }
  };
</script>

<style lang="less" scoped>
  .fields-editor {
    &__item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      &-select {
        width: 1px;
        flex: auto 1 1;
      }

      &-remove {
        margin-left: 8px;
        cursor: pointer;
        border-radius: 50%;
        width: 12px;
        height: 12px;
        background: #dddddd;
        color: #777777;
        line-height: 8px;
        font-size: 16px;
        text-align: center;
        &:hover {
          background: #f54547;
          color: #ffffff;
        }
      }
    }

    &__add-button {
      margin-top: 8px;
      width: 100%;
      color: #026ac8;
      border-color: rgba(2, 106, 200, 0.5);
      .iconfont {
        font-size: 12px;
        margin-right: 4px;
      }

      &:hover {
        opacity: 0.8;
      }
    }

    &__write-mode {
      margin-top: 12px;
      border-top: 1px solid #e0e3eb80;
      .form-item {
        margin-top: 8px;
      }
    }
  }
</style>
