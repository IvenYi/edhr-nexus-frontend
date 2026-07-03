<template>
  <div style="max-height: 368px; overflow: auto">
    <a-button
      type="link"
      @click="addGridCol"
      size="small"
      style="padding: 0 4px; position: absolute; right: 0; top: -26px"
    >
      {{ t('sys.add') }}
    </a-button>
    <div
      v-for="(_span, index) in propValue"
      :key="index"
      class="p4px mb4px"
      style="background-color: #f2f4f7; border-radius: 4px"
    >
      <a-row align="middle">
        <a-col :span="6">{{ t('sys.pageDesigner.gridCol') + (index + 1) }}</a-col>
        <a-col :span="15">
          <a-form-item-rest>
            <a-input-number
              v-model:value="propValue[index]"
              :min="1"
              :max="24"
              size="small"
              @blur="propValue[index] == undefined && (propValue[index] = 1)"
              @change="changeGridColSpan(index)"
            />
          </a-form-item-rest>
        </a-col>
        <a-col :span="3" class="text-right">
          <i
            v-show="propValue.length > 1"
            class="iconfont icon-shanchu2 cursor-pointer error-gct-hover text-[#333333]"
            @click="delGridCol(index)"
          ></i>
          <!-- <a-button type="link" @click="delGridCol(index)" danger size="small">
            <template #icon>
              <delete-outlined />
            </template>
          </a-button> -->
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts" name="col-span-editor">
  import { cloneDeep, merge } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { widget as gridCol } from '/@page-designer/schema/web/layout/grid-col';
  import { buildShortUUID } from '/@/utils/uuid';
  import { GridCol } from '/@page-designer/types/web';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { emitCache } = useDesigner();
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const addGridCol = () => {
    propValue.value.push(12);
    (defProps.widget?.children as GridCol[]).push(
      merge(cloneDeep(gridCol), {
        id: buildShortUUID('grid-col'),
        alias: t('sys.pageDesigner.gridchild'),
        props: { span: 12 },
      }),
    );
    emitCache();
  };
  const delGridCol = (index) => {
    propValue.value.splice(index, 1);
    (defProps.widget?.children as GridCol[]).splice(index, 1);
    emitCache();
  };
  const changeGridColSpan = (index) => {
    (defProps.widget!.children as GridCol[])[index].props.span = propValue.value[index];
    emitCache();
  };
</script>

<style lang="less" scoped></style>
