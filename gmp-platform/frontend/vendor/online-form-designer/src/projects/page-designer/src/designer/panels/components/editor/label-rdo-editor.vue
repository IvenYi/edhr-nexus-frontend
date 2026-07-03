<template>
  <a-form-item :label="label">
    <a-input-group compact>
      <a-select
        :style="{
          width: beforeWidth + 'px',
        }"
        v-model:value="val"
        :options="items"
        @focus="onFocus"
      />
      <a-select
        v-if="val === KeyMode.TRANSACTION"
        :style="{ width: `calc(100% - ${beforeWidth}px)` }"
        v-model:value="val2"
        :options="items2"
        @focus="onFocus2"
        allowClear
      />
      <a-select
        v-else
        v-model:value="val2"
        :style="{ width: `calc(100% - ${beforeWidth}px)` }"
        :options="optionsData"
        :showArrow="false"
        dropdownClassName="gct-project-select-dropdown hidden"
        :placeholder="t('sys.chooseText')"
        :fieldNames="{ label: 'fieldLabel', value: 'id' }"
        optionLabelProp="showTitle"
        @click="openModal()"
        @change="changeSelect"
      />
    </a-input-group>
  </a-form-item>
</template>
<script lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed, ref, Ref, toRaw, h, watch, defineComponent } from 'vue';
  import { KeyMode } from '@gct/runtime';
  import { PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import labelTmplModal from '../../../../components/widgets/web/__components__/print-tmpl-modal.vue';
  import { taglabel } from '/@page-designer/components/widgets/web/__components__/formcomponent/index';
  import { getPrintDesignerInfo } from '/@/apis/gct-apaas/PrintDesignerController';

  export default defineComponent({
    name: 'LabelRdoEditor',
    props: {
      label: {
        type: String,
      },
      beforeValue: {
        type: String,
        required: true,
      },
      afterValue: {
        type: String,
        required: true,
      },
      beforeWidth: {
        type: Number,
        default: 152,
      },
      beforeOption: {
        type: Function || Array<IData>,
        required: true,
      },
      afterOption: {
        type: Function || Array<IData>,
        required: true,
      },
      size: {
        type: String,
        default: 'default',
      },
      isTreeSelect: {
        type: Boolean || (Function as PropType<(IData) => Boolean>),
        default: () => false,
      },
      slots: {
        type: Object,
      },
      modelKey: {
        type: String,
        required: true,
      },
      moduleType: {
        type: String as PropType<PrintTypeEnum>,
        default: PrintTypeEnum.LABEL,
      },
    },
    emits: ['update:beforeValue', 'update:afterValue'],
    setup(props, { emit }) {
      const { t } = useI18n();

      const items: Ref<any[]> = ref(Array.isArray(props.beforeOption) ? props.beforeOption : []);
      const items2: Ref<any[]> = ref(Array.isArray(props.afterOption) ? props.afterOption : []);

      const optionRdo = ref<any[]>([]);

      const val = computed({
        get() {
          return props.beforeValue;
        },
        async set(val) {
          if (val === KeyMode.TRANSACTION) {
            onFocus2();
          }
          emit('update:beforeValue', val);
          val2.value = null as any;
          items2.value = [];
        },
      });

      async function getTmplInfo(id) {
        const res: any = await getPrintDesignerInfo({
          id,
          moduleType: props.moduleType || PrintTypeEnum.LABEL,
        });
        res &&
          optionRdo.value.push({ ...res, id: res.baseId ? res.baseId + ':' + res.id : res.id });
        return res;
      }
      const optionsData = computed(() => {
        const data = optionRdo.value.map((e) => {
          return {
            ...e,
            fieldLabel: e.name,
            showTitle: h('div', [
              h(taglabel, {
                label: e.name,
                isDesign: false,
                style: {
                  display: 'inline-block',
                },
              }),
              e.version ? null : h('span', { class: 'gct-custom-tag ml8px' }, t('sys.default')),
            ]),
          };
        });
        return data;
      });

      const val2 = computed({
        get() {
          if (val.value === KeyMode.TRANSACTION) {
            onFocus2();
          }
          return props.afterValue || undefined;
        },
        set(val) {
          emit('update:afterValue', val);
        },
      });

      watch(
        () => props.afterValue,
        async () => {
          if (props.afterValue) {
            let data = optionRdo.value.find((e) => e.id === props.afterValue);
            if (!data) {
              const id = props.afterValue
                ? props.afterValue.split(':')[1] || props.afterValue.split(':')[0]
                : '';
              data = await getTmplInfo(id);
            }
          }
        },
        {
          immediate: true,
        },
      );

      async function changeSelect(v) {
        if (!v) {
          getOptionValue(v);
        }
      }

      const openModal = async () => {
        const res: any = await gct.openUtil.modal(
          labelTmplModal,
          {
            selected: getOptionValue(),
            moduleType: props.moduleType || PrintTypeEnum.LABEL,
            isAll: true,
            isRdo: false,
          },
          {
            title: t('sys.pageDesigner.chooseTmplSth', { sth: props.label }),
            width: 1100,
            height: 734,
            okText: t('sys.okText'),
          },
        );
        if (res.ok && res.params?.selected) {
          const { selected } = res.params;

          if (!optionRdo.value.some((e) => e.id === selected[0].id)) {
            optionRdo.value.push({ ...selected[0] });
          }

          val2.value = selected[0].id;
          changeSelect(selected[0].id);
        }
      };

      /**
       * 获取选中的options
       */
      function getOptionValue(v = val2.value) {
        let data = optionRdo.value.find((i) => i.id === v);
        return toRaw(data);
      }

      const onFocus = async () => {
        if (props.beforeOption) {
          if (Array.isArray(props.beforeOption)) {
            items.value = props.beforeOption;
          } else {
            items.value = await props.beforeOption();
          }
        }
        items.value.forEach((item) => {
          item.label = t(item.label);
        });
      };

      onFocus();

      const onFocus2 = async () => {
        if (props.afterOption) {
          if (Array.isArray(props.afterOption)) {
            items2.value = props.afterOption.filter((item) => {
              return item.label && item.label.includes(val.value);
            });
          } else {
            items2.value = await props.afterOption(
              val.value,
              items.value.find((item) => item.value === val.value),
            );
          }
        }
        items2.value.forEach((item) => {
          item.label = t(item.label);
        });
      };
      return {
        t,
        val,
        val2,
        items,
        items2,
        onFocus,
        onFocus2,
        openModal,
        optionsData,
        KeyMode,
        changeSelect,
      };
    },
  });
</script>

<style lang="less" scoped></style>
