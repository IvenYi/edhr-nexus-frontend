<template>
  <div class="ks-row-middle">
    <van-field v-bind="formAttr" style="width: auto; flex: 1" v-model="value">
      <template #label>
        <span> {{ displayLabelText ? widget.props.label || widget.alias : '' }}</span>
      </template>
      <template #input>
        <div class="ks-row-middle" style="width: 100%" v-if="isShowRang">
          <div class="start-item">
            <taglabel v-if="readonly" isDesign :type="fieldType" />
            <div class="input-placeholder" v-else>{{ placeholder }}</div>
          </div>
          <div class="w6 text-center">-</div>
          <div class="end-item">
            <taglabel v-if="readonly" isDesign :type="fieldType" />
            <div class="input-placeholder" v-else>{{ placeholder }}</div>
          </div>
        </div>
        <div v-else class="ks-row-middle">
          <div style="flex: 1">
            <taglabel v-if="readonly" isDesign :type="fieldType" />
            <span v-else class="input-placeholder"> {{ placeholder }}</span>
          </div>
        </div>
      </template>
    </van-field>
    <span v-if="!isShowRang && showMoreOptions" class="more-setting">
      <i class="icon gct-iconfont icon-shaixuan-chaxun"></i>
      <!-- <van-icon name="setting-o" size="12" :color="useMore ? '#0daa9c' : '#c8c9cc'" /> -->
    </span>
  </div>
</template>

<script name="gct-search-input" setup lang="ts">
  import { computed, reactive, toRefs, watch } from 'vue';
  import { SearchWidgets } from '/@page-designer/types/web/search-widget-types';
  import { SearchComponents } from '/@page-designer/enum';
  import taglabel from '/@page-designer/components/widgets/web/__components__/formcomponent/field-label/taglabel.vue';
  import { isArray } from '/@/utils/is';

  const props = defineProps<{ modelValue?: string; widget: SearchWidgets }>();

  const emit = defineEmits(['update:modelValue', 'search']);
  const { type } = reactive(props.widget);

  const { field, fieldType, fieldName } = reactive(props.widget.props);

  const { displayLabelText, placeholder, isRang, readonly, moreOptions, useMore } = toRefs(
    props.widget.props,
  );

  const showMoreOptions = computed(() => {
    return moreOptions?.value?.length > 0 && !readonly.value;
  });

  const isShowRang = computed(() => {
    return (
      [
        SearchComponents.SearchDate,
        SearchComponents.SearchDateTime,
        SearchComponents.SearchTime,
        SearchComponents.SearchNumberInput,
        SearchComponents.SearchStringNumberInput,
      ].includes(type) && isRang?.value
    );
  });

  const formAttr = computed(() => {
    const res = {};

    if (
      [
        SearchComponents.SearchNumberInput,
        SearchComponents.SearchSwitch,
        SearchComponents.SearchDate,
        SearchComponents.SearchDateTime,
        SearchComponents.SearchTime,
        SearchComponents.SearchSelect,
        SearchComponents.SearchRdoSelect,
        SearchComponents.SearchPrinter,
        SearchComponents.SearchUserSelect,
        SearchComponents.SearchSelectDepartment,
        SearchComponents.SearchTransaction,
        SearchComponents.SearchTmplTreeSelect,
      ].includes(type)
    ) {
      Object.assign(res, {
        isLink: true,
        clickable: true,
      });

      if (isShowRang.value) {
        Object.assign(res, {
          isLink: false,
        });
      }
    }

    return {
      name: field,
      readonly: true,
      inputAlign: 'right',
      ...res,
    };
  });

  const value = computed({
    get() {
      return props.modelValue;
    },
    set(value) {
      emit('update:modelValue', value);
    },
  });
  watch(
    () => props.widget.props.multiple,
    (n, o) => {
      if (o === undefined) return;
      if (
        n === true &&
        props.widget.props.defaultValue &&
        !isArray(props.widget.props.defaultValue)
      ) {
        props.widget.props.defaultValue = [props.widget.props.defaultValue];
      } else if (n === false) {
        props.widget.props.defaultValue = undefined;
      }
    },
  );
  defineExpose({});
</script>

<style lang="less" scoped>
  .input-placeholder {
    color: #c8c9cc;
  }

  .start-item,
  .end-item {
    display: flex;
    position: relative;
    flex: 1;
    align-items: center;
    justify-content: flex-end;
  }

  :deep(.van-cell__right-icon) {
    display: flex;
    align-items: center;
    height: auto;
    margin-left: 4px;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    line-height: inherit;
  }

  .more-setting {
    width: 32px;
    height: 32px;
    color: #a6a6a6;
    border: 1px solid #e0e3eb;
    border-radius: 4px;
    text-align: center;
    line-height: 30px;
    margin-left: -4px;
    .gct-iconfont {
      font-size: 12px;
    }
  }
</style>
