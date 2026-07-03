<template>
  <div :class="[ns.b()]">
    <Teleport :to="`#${typeFormFooterId}`">
      <a-form-item :label="$t('sys.format')" required :label-col="{ style: 'width: 36px;' }">
        <a-select
          :class="[ns.e('field-select')]"
          :value="formState.signatureType"
          :options="signatureTypeOptions"
          :disabled="bpmnReadonly"
          @change="onSignatureTypeChange"
        />
      </a-form-item>
    </Teleport>
    <div :class="[ns.e('list')]" v-if="fieldSelectList?.length">
      <div :class="[ns.e('list-item')]" v-for="(item, index) in fieldSelectList" :key="index">
        <i
          :class="['iconfont mr-4px color-[#026AC8]', getFieldIcon(item.type) || 'icon-zidingyi']"
        ></i>
        <a-select
          :class="[ns.e('field-select')]"
          v-model:value="item.key"
          :placeholder="t('sys.inputText')"
          :options="getOptionsByType(item.type)"
          :disabled="bpmnReadonly"
          @change="emitValueChange"
        />
        <i
          v-if="!bpmnReadonly"
          :class="['iconfont icon-shanchu2', ns.e('remove')]"
          @click="() => onRemove(index)"
        ></i>
      </div>
    </div>
    <div :class="[ns.e('footer')]">
      <a-button :class="[ns.e('add-field')]" @click="addField" danger :disabled="bpmnReadonly">
        <i :class="['iconfont icon-tianjia']"></i>
        {{ $t('sys.onlineForm.assignSignatureField') }}
      </a-button>
      <a-button
        v-if="formState.signatureType !== SignatureTypeEnum.SIGNATURE_ONLY"
        danger
        :class="[ns.e('add-field'), 'ml-12px']"
        @click="addDateField"
        :disabled="bpmnReadonly"
      >
        <i :class="['iconfont icon-tianjia']"></i>
        {{ $t('sys.onlineForm.assignDateField') }}
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup name="fill-sign-field">
  import { FIELD_TYPE, useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { IANEAFillSignField } from '../types';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { isSystemField } from '/@online-form/utils/field.enum';
  import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
  import { computed, ref, inject, watch } from 'vue';
  import { SignatureTypeEnum } from '@gct/nocode-base';
  import { cloneDeep, isNil } from 'lodash-es';

  const typeFormFooterId = inject('typeFormFooterId');

  const bpmnReadonly = inject('bpmnReadonly', false);
  const ns = useNamespace('fill-sign-field');
  const { t } = useI18n() as any;

  const signatureTypeOptions = Object.keys(SignatureTypeEnum).map((key) => {
    return {
      label: t('sys.pageDesigner.' + SignatureTypeEnum[key]),
      value: SignatureTypeEnum[key],
    };
  });

  const getFieldIcon = (type: FIELD_TYPE) => {
    switch (type) {
      case FIELD_TYPE.SIGNATURE:
      case FIELD_TYPE.REPORTER:
      case FIELD_TYPE.WAREHOUSE_MANAGER:
        return 'icon-fuzhiqianming';
      case FIELD_TYPE.DATE:
      case FIELD_TYPE.DATE_TIME:
        return 'icon-fuzhiriqi';
      default:
        return '';
    }
  };

  const { modelMetaMap, masterModel } = useModelFields();
  /** 所有符合的字段集合 */
  const validFields = computed(() => {
    return modelMetaMap.value[masterModel.value.key!].fields.filter((field) => {
      if (
        // 排除非用户自建字段
        field.createType !== 'USER_DEFINED' ||
        // 排除关联主子关系的字段
        field.bindInfo ||
        // 排除系统字段
        isSystemField(field.key!)
      ) {
        return false;
      }
      return [
        FIELD_TYPE.SIGNATURE,
        FIELD_TYPE.REPORTER,
        FIELD_TYPE.WAREHOUSE_MANAGER,
        FIELD_TYPE.DATE_TIME,
        FIELD_TYPE.DATE,
      ].includes(field.type!);
    });
  });

  /** 签名字段选项 */
  const signFieldsOptions = computed(() => {
    return toOptions(
      validFields.value.filter((field) =>
        [FIELD_TYPE.SIGNATURE, FIELD_TYPE.REPORTER, FIELD_TYPE.WAREHOUSE_MANAGER].includes(
          field.type!,
        ),
      ),
    );
  });

  /** 日期字段选项 */
  const dateFieldsOptions = computed(() => {
    return toOptions(validFields.value.filter((field) => [FIELD_TYPE.DATE].includes(field.type!)));
  });

  /** 日期时间字段选项 */
  const dateTimeFieldsOptions = computed(() => {
    return toOptions(
      validFields.value.filter((field) => [FIELD_TYPE.DATE_TIME].includes(field.type!)),
    );
  });

  function getOptionsByType(type: FIELD_TYPE) {
    switch (type) {
      case FIELD_TYPE.DATE:
        return dateFieldsOptions.value;
      case FIELD_TYPE.DATE_TIME:
        return dateTimeFieldsOptions.value;
      case FIELD_TYPE.SIGNATURE:
      case FIELD_TYPE.REPORTER:
      case FIELD_TYPE.WAREHOUSE_MANAGER:
      default:
        return signFieldsOptions.value;
    }
  }

  /** 字段key和字段类型映射 */
  const fieldKey2TypeMap = computed(() => {
    const map: Record<string, FIELD_TYPE> = {};
    validFields.value.forEach((field) => {
      map[field.key!] = field.type!;
    });
    return map;
  });

  const props = withDefaults(
    defineProps<{
      value: IANEAFillSignField;
    }>(),
    {
      value: undefined,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: IANEAFillSignField): void;
  }>();

  /** 记录上一次抛出去的值字符串 */
  let formState = ref<IANEAFillSignField>({} as any);

  const emitValueChange = () => {
    formState.value.fillSignFields = fieldSelectList.value
      .filter((i) => i.key)
      .map((item) => item.key);
    emit('update:value', formState.value);
  };

  const fieldSelectList = ref<
    Array<{
      type: FIELD_TYPE;
      key: string;
    }>
  >([]);

  function toOptions(fields: FieldMetaDTO[]) {
    return fields.map((field) => {
      return {
        value: field.key,
        label: `${field.name}[${field.key}]`,
      };
    });
  }

  /** 根据外面的值重置组件状态，并修正值的数据，必要时抛出修改后的值 */
  function resetCompState() {
    // 修正数据
    if (formState.value && isNil(formState.value.signatureType)) {
      formState.value.signatureType = SignatureTypeEnum.SIGNATURE_ONLY;
    }

    // 根据值初始化字段选择列表
    fieldSelectList.value = [];
    if (props.value && props.value.fillSignFields?.length) {
      props.value.fillSignFields.forEach((fieldKey) => {
        fieldSelectList.value.push({
          type: fieldKey2TypeMap.value[fieldKey],
          key: fieldKey,
        });
      });
    } else {
      fieldSelectList.value.push({ type: FIELD_TYPE.SIGNATURE, key: '' });
    }
  }

  watch(
    () => props.value,
    (newVal) => {
      /** 值没有变化，不处理 */
      if (JSON.stringify(newVal) === JSON.stringify(formState.value)) {
        return;
      }
      formState.value = newVal ? cloneDeep(newVal) : ({} as any);
      resetCompState();
    },
    { immediate: true, deep: true },
  );

  const onRemove = (index: number) => {
    fieldSelectList.value?.splice(index, 1);
    emitValueChange();
  };

  const addField = () => {
    fieldSelectList.value.push({
      type: FIELD_TYPE.SIGNATURE,
      key: '',
    });
  };
  const addDateField = () => {
    fieldSelectList.value.push({
      type:
        formState.value.signatureType === SignatureTypeEnum.SIGNATURE_DATE
          ? FIELD_TYPE.DATE
          : FIELD_TYPE.DATE_TIME,
      key: '',
    });
  };

  const onSignatureTypeChange = (type) => {
    formState.value.signatureType = type;
    // 过滤出符合当前签名类型的字段，剔除不符合的字段
    fieldSelectList.value = fieldSelectList.value.filter((item) => {
      const allowTypes = [FIELD_TYPE.SIGNATURE, FIELD_TYPE.REPORTER, FIELD_TYPE.WAREHOUSE_MANAGER];
      if (formState.value.signatureType === SignatureTypeEnum.SIGNATURE_DATE) {
        allowTypes.push(FIELD_TYPE.DATE);
      } else if (formState.value.signatureType === SignatureTypeEnum.SIGNATURE_DATETIME) {
        allowTypes.push(FIELD_TYPE.DATE_TIME);
      }
      return allowTypes.includes(item.type);
    });
    emitValueChange();
  };
</script>

<style lang="scss" scoped>
  $fill-sign-field: (
    height: auto,
  );

  @include b(fill-sign-field) {
    @include set-component-css-var(fill-sign-field, $fill-sign-field);
    height: getCssVar(fill-sign-field, height);

    @include e(list-item) {
      display: flex;
      align-items: center;
      padding: 4px;
      background: #ffffff;
      border-radius: 4px;
      margin-top: 4px;
    }

    @include e(field-select) {
      flex-grow: 1;
    }

    @include e(remove) {
      cursor: pointer;
      color: #333333;
      padding-left: 4px;
    }

    @include e(footer) {
      text-align: center;
      display: flex;
    }

    @include e(add-field) {
      flex-grow: 1;
      width: 120px;
      margin-top: 8px;
      padding: 3px 14px;
      --ant-error-color: #026ac8 !important;
      --ant-error-color-hover: #40a9ff !important;

      .iconfont {
        font-size: 10px;
        margin-right: 4px;
      }
    }
  }
</style>
