<template>
  <MultipleDrop
    :class="[ns.b()]"
    @dragover="handleDragOver"
    @drop="handleDrop"
    :dragText="$t('sys.onlineForm.dragFieldIn')"
    :items="multipleItems"
    :disabled="disabled"
    @update:selectedIndex="handleSelectedChange"
    @move="handleMove"
    @remove="handleRemove"
  />
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useNamespace } from '@gct/runtime';
  import MultipleDrop from '/@online-form/views/designer/modules/base/drag/multiple-drop.vue';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { TransferType, useDrop } from '/@online-form/views/designer/modules/base/drag/use-drop';
  import type { IBindField } from '@gct/nocode-base';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import FieldConfig from '/@online-form/views/designer/modules/base/field-config.vue';
  import { getFieldIcon } from '/@online-form/utils/field.enum';
  import { FIELD_TYPE } from '@/enums/appEnum';

  const { t } = useI18n();

  const ns = useNamespace('attach-fields-editor');

  const { getFieldMeta } = useModelFields();

  const props = withDefaults(
    defineProps<{
      items?: CellWidget.AttachField[];
      disabled: boolean;
      isFieldConfigurable?: boolean;
      customFieldTypes?: FIELD_TYPE[];
      customFieldMsg?: string;
    }>(),
    {
      isFieldConfigurable: true,
    },
  );

  const emit = defineEmits<{
    (e: 'item-click', item: CellWidget.AttachField): void;
    (e: 'update:items', items: CellWidget.AttachField[] | undefined): void;
  }>();

  const getFieldName = (field: IBindField) => {
    return getFieldMeta(field).name;
  };

  const { handleDragOver, handleDrop } = useDrop([TransferType.Field], {
    onFieldDrop(fieldMeta, fieldWidget) {
      const allowFieldTypes = props.customFieldTypes?.length
        ? props.customFieldTypes
        : [
            FIELD_TYPE.TEXT,
            FIELD_TYPE.LONG_TEXT,
            FIELD_TYPE.INTEGER,
            FIELD_TYPE.LONG,
            FIELD_TYPE.DOUBLE,
            FIELD_TYPE.DECIMAL,
            FIELD_TYPE.DATE,
            FIELD_TYPE.TIME,
            FIELD_TYPE.DATE_TIME,
            FIELD_TYPE.MATERIAL_NO,
            FIELD_TYPE.RELATED_LOT_NO,
            FIELD_TYPE.PRODUCT,
            FIELD_TYPE.DEVICE,
            FIELD_TYPE.MFG_ORDER,
            FIELD_TYPE.RECORD_NO,
            FIELD_TYPE.ORDER_NO,
            FIELD_TYPE.TRACE_DATE,
          ];

      if (!allowFieldTypes.includes(fieldMeta.fieldType as FIELD_TYPE)) {
        message.warn(props.customFieldMsg ?? $t('sys.onlineForm.BindFieldValidateTip'));
        return;
      }

      const arr = props.items || [];
      arr.push({ fieldMeta, fieldWidget });
      emit('update:items', arr);
    },
  });

  const multipleItems = computed(() => {
    return props.items?.map((item) => {
      return {
        label: getFieldName(item.fieldMeta!)!,
        icon: getFieldIcon(item.fieldMeta!.fieldType!),
      };
    });
  });

  const handleSelectedChange = (index: number | undefined) => {
    if (!props.isFieldConfigurable) {
      return;
    }
    if (index === undefined) {
      return;
    }
    const item = props.items![index];
    gct.openUtil.drawer(
      FieldConfig,
      {
        fieldMeta: item.fieldMeta,
        fieldWidget: item.fieldWidget,
      },
      { title: getFieldName(item.fieldMeta) },
    );
  };

  const handleMove = (args: { newIndex: number; oldIndex: number }) => {
    if (!props.items) {
      return;
    }
    const arr = [...props.items];
    const el = arr.splice(args.oldIndex, 1);
    arr.splice(args.newIndex, 0, ...el);
    emit('update:items', arr);
  };

  const handleRemove = (index: number) => {
    if (!props.items) {
      return;
    }
    const arr = [...props.items];
    arr.splice(index, 1);
    emit('update:items', arr);
  };
</script>

<style lang="scss" scoped>
  @include b(attach-fields-editor) {
    padding: 4px;
    border-color: transparent;
  }
</style>
