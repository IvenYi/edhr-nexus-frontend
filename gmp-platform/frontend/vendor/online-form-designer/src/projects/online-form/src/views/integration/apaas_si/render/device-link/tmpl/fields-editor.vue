<template>
  <div :class="['fields-editor', (hiddenActions || readonly) && 'fields-editor--hidden-actions']">
    <template v-if="formState.formFields">
      <div class="fields-editor__row" v-for="(field, index) in formState.formFields" :key="index">
        <FormFieldSelect
          :readonly="readonly"
          class="fields-editor__row-select"
          v-model="formState.formFields[index]"
          :subModelKey="map.subModelKey"
        />
        <div class="fields-editor__actions">
          <i
            v-if="allowMultiple"
            @click="addField"
            class="fields-editor__btn fields-editor__add-btn iconfont icon-pad_icon_add_blue"
            :title="$t('sys.add')"
          ></i>
          <i
            v-if="formState.formFields.length > 1"
            @click="removeField(index)"
            class="fields-editor__btn fields-editor__remove-btn iconfont icon-shanchu1"
            :title="$t('sys.delete')"
          ></i>
        </div>
      </div>
    </template>
    <template v-if="!formState.formFields">
      <div class="fields-editor__row">
        <FormFieldSelect
          :readonly="readonly"
          v-model="formState.formField"
          :subModelKey="map.subModelKey"
        />
        <div class="fields-editor__actions">
          <i
            v-if="allowMultiple"
            @click="addField"
            class="fields-editor__btn fields-editor__add-btn iconfont icon-pad_icon_add_blue"
            :title="$t('sys.add')"
          ></i>
        </div>
      </div>
    </template>
    <div class="fields-editor__row" v-if="allowMultiple && formState.formFields">
      <a-form-item :label="$t('sys.edhr.writeBackMode')">
        <a-radio-group v-model:value="formState.writeBackMode">
          <a-radio :value="DeviceLink.WriteBackModeEnum.ROUTINE">{{
            $t('sys.edhr.routine')
          }}</a-radio>
          <a-radio :value="DeviceLink.WriteBackModeEnum.MOUSE_FOCUS">{{
            $t('sys.edhr.MouseFocus')
          }}</a-radio>
        </a-radio-group>
      </a-form-item>
    </div>
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
      hiddenActions?: boolean;
      readonly?: boolean;
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
    &__row {
      display: flex;
      align-items: center;
      height: 45px;
      padding-left: 16px;

      &:not(:last-child) {
        border-bottom: 1px solid #e8ebf0;
      }

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

    &__actions {
      width: 120px;
      padding-left: 32px;
      display: flex;
      align-items: center;
      flex-shrink: 0;

      > .iconfont {
        margin-right: 10px;
        cursor: pointer;

        &:not(:last-child)::after {
          content: '';
          display: inline-block;
          width: 1px;
          height: 10px;
          background: #e8ebf0;
          margin-left: 10px;
        }
      }
    }

    &__add-btn {
      color: #026ac8;
    }

    &__remove-btn {
      color: #8b8b8b;
    }

    &__btn {
      &:hover {
        opacity: 0.8;
      }
      .iconfont {
        font-size: 12px;
        margin-right: 4px;
      }
    }

    &--hidden-actions {
      .fields-editor__actions {
        visibility: hidden;
        opacity: 0;
      }
    }

    :deep(.ant-form-item) {
      margin-bottom: 0;
    }
  }
</style>
