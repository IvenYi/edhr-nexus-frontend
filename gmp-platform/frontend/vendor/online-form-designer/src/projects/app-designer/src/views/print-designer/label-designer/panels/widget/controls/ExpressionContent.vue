<template>
  <div class="expression-content w-full">
    <div class="setting-row">
      <!-- <div class="sub-title" :style="{ width: '26px' }"></div> -->
      <div class="sub-content">
        <a-input
          @click="openExpress"
          :value="val.expression"
          :placeholder="t('sys.pageDesigner.pleaseEnterAnExpression')"
          readonly
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed } from 'vue';
  import { FIELD_TYPE } from '@gct/runtime';
  import useExpression, { ExpressionModeEnum, ExpressionTabEnum } from '/@/components/Expression';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { identify } from '/@/components/Expression/utils/expression';
  import { usePage } from '../../../hooks/usePage';

  export default defineComponent({
    // eslint-disable-next-line vue/component-definition-name-casing
    name: 'expression-content',
    props: {
      value: {
        type: Object,
        default: () => {
          return {};
        },
      },
      maxLevel: {
        type: Number,
        default: 3,
      },
    },
    emits: ['update:value', 'changeEvent'],
    setup(props, { emit }) {
      const t = window.$t;

      const val = computed({
        get() {
          return props.value;
        },
        set(v) {
          emit('update:value', v);
          emit('changeEvent', v);
        },
      });

      const { project } = usePage();

      const { openModal } = useExpression();

      const map: Map<string, any[]> = new Map();

      const loadOptions = async (modelKey, level = 1) => {
        if (level > props.maxLevel) {
          return [];
        }
        const items: any[] = [];
        let files: any[] = [];
        if (!map.has(modelKey)) {
          files = (await getFieldMetaList({ modelKey }))!;
          if (files && files.length > 0) {
            map.set(modelKey, files);
          } else {
            files = [];
          }
        } else {
          files = map.get(modelKey)!;
        }
        const all: Promise<void>[] = [];
        files.forEach((item) => {
          const opt: any = {
            id: item.key,
            name: item.name,
          };
          items.push(opt);
          if (
            (item.type === FIELD_TYPE.REF || item.type === FIELD_TYPE.RDO_REF) &&
            level <= props.maxLevel
          ) {
            const fn = async () => {
              const arr = await loadOptions(item.bindInfo, level + 1);
              if (arr && arr.length > 0) {
                opt.children = arr;
              }
            };
            all.push(fn());
          }
        });
        await Promise.all(all);
        return items;
      };

      const openExpress = async () => {
        const items = !project.value ? [] : await loadOptions(project.value.modelKey!);
        openModal({
          expr: val.value.exp,
          mode: ExpressionModeEnum.LABEL_PRINT,
          identifiers: {
            [ExpressionTabEnum.FIELD]: items,
          },
          callback: (expr, exprLabel) => {
            const items = identify(expr);
            val.value = {
              exp: expr,
              expression: exprLabel,
              relationColumns: items,
            };
          },
        });
      };

      return { t, openExpress, val };
    },
  });
</script>
