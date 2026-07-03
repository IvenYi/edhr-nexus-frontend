<template>
  <div>
    <div class="ks-row-middle">
      <div>{{ $t('sys.pageDesigner.datafiltering') }}</div>
      <a-tooltip placement="top">
        <template #title>{{
          $t('sys.pageDesigner.restrictedDataTable', { sth: $t(widget?.name) })
        }}</template>
        <span class="iconfont icon-assist ml5px text-[#bfbfbf]"></span>
      </a-tooltip>
      <a @click="handleClick" class="ml-auto">
        {{ $t('sys.pageDesigner.add') }}
      </a>
    </div>
    <template v-if="propValue">
      <div v-for="(i, index) in propValue" :key="index" class="ks-row-middle bg-[#f5f5f5]">
        <div class="ks-col">
          <a-form-item required>
            <template #label>
              <div class="w212px ks-row-between pt14px">
                数据字段
                <a-popconfirm
                  placement="topLeft"
                  :title="$t('sys.pageDesigner.areYouSureToDelete')"
                  @confirm="deleteList(index)"
                >
                  <span
                    class="icon-shanchu iconfont cursor-pointer text-[#999] error-gct-hover"
                  ></span>
                </a-popconfirm>
              </div>
            </template>
            <a-select
              v-model:value="i.key"
              :placeholder="$t('sys.chooseText')"
              @change="(v) => changeField(v, i)"
              size="small"
            >
              <a-select-option
                v-for="(opt, index) in selectOptions"
                :value="opt.key"
                :key="index"
                :disabled="opt.disabled"
                >{{ opt.name }}</a-select-option
              >
            </a-select>
          </a-form-item>
          <a-form-item required label="值">
            <a-select
              v-model:value="i.value"
              :placeholder="$t('sys.chooseText')"
              :mode="i.multiple ? 'multiple' : ''"
              size="small"
            >
              <a-select-option
                v-for="(opt, index) in dictmap[i.key]"
                :value="opt.value"
                :key="index"
                >{{ opt.text }}</a-select-option
              >
            </a-select>
          </a-form-item></div
        >
      </div>
    </template>
  </div>
</template>

<script setup lang="ts" name="datafiltering-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { ref, toRefs, reactive, toRef } from 'vue';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { getEnumModelFieldPageList } from '/@/apis/gct-apaas/EnumModelFieldController';
  import { SEARCH_SEVICE } from '@/enums/designEnum';
  import { pick } from 'lodash-es';

  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const { widget } = toRefs(defProps);
  const options = ref<ReturnPromiseType<typeof getFieldMetaList>>([]);
  const propConfig = reactive(defProps.propConfig);

  const dictmap = reactive({});
  const selectOptions = toRef(() => {
    return options.value?.map((i) => {
      const disabled = !!propValue.value.find((j) => j.key == i.key);
      return { ...i, disabled };
    });
  });
  getFieldMetaList({ modelKey: widget.value?.props[propConfig.modelKey] }).then((res) => {
    options.value = res?.filter(
      (i) =>
        i.type === FIELD_TYPE.ENUM ||
        i.type === FIELD_TYPE.ENUM_MULTI ||
        i.type === FIELD_TYPE.BOOLEAN,
    );

    propValue.value &&
      propValue.value.forEach((i) => {
        changeField(i.key, {});
      });
  });

  function handleClick() {
    if (!propValue.value) {
      propValue.value = [{ value: undefined, key: undefined, multiple: false, ope: '' }];
    } else {
      propValue.value = [
        ...propValue.value,
        { value: undefined, key: undefined, multiple: false, ope: '' },
      ];
    }
  }
  function deleteList(index) {
    propValue.value.splice(index, 1);
  }
  const sourceValueMap = {
    [FIELD_TYPE.ENUM]: {
      ope: SEARCH_SEVICE.IN,
      multiple: true,
      async callback({ bindInfo }) {
        const { data } = await getEnumModelFieldPageList({ enumModelKey: bindInfo, pageSize: 999 });
        return data;
      },
    },
    [FIELD_TYPE.ENUM_MULTI]: {
      ope: SEARCH_SEVICE.CONTAINANY,
      multiple: true,
      async callback({ bindInfo }) {
        const { data } = await getEnumModelFieldPageList({ enumModelKey: bindInfo, pageSize: 999 });
        return data;
      },
    },
    [FIELD_TYPE.BOOLEAN]: {
      ope: SEARCH_SEVICE.EQ,
      multiple: false,
      callback({ specificConfig }) {
        if (specificConfig) {
          const data = pick(specificConfig, ['true', 'false']) ?? {};
          return Object.keys(data).map((i) => {
            return { value: i === 'true', text: data[i] };
          });
        }
        return [];
      },
    },
  };
  async function changeField(v, item) {
    const { bindInfo, type, specificConfig } = options.value?.find((i) => i.key === v) || {};
    item.value = undefined;
    const { ope, callback, multiple } = sourceValueMap[type as FIELD_TYPE];
    item.ope = ope;
    item.multiple = multiple;
    if (!dictmap[v]?.length) {
      dictmap[v] = await callback({ bindInfo, specificConfig });
    }
  }
</script>

<style lang="less" scoped>
  :deep(.ant-form-item) {
    margin: 0;
    margin-bottom: 14px;
  }

  :deep(.icon-assist:hover) {
    color: var(--ant-primary-color);
  }
</style>
