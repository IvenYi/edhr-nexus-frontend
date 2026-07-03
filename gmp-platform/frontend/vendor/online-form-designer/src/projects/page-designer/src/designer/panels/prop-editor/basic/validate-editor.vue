<template>
  <div>
    <div class="text-[#c3c3c3] text-12px"> {{ $t('sys.pageDesigner.valimesg') }}</div>
    <div class="mt4px">
      <a-button type="primary" @click="addRule" ghost block>
        {{ $t('sys.pageDesigner.addRule') }}
      </a-button>
    </div>
    <commonDraggableList
      class="mt8px"
      v-model="propValue"
      @editRow="editRule"
      label-key="ruleName"
    />
    <basic-modal
      @register="registerInner"
      :title="$t('sys.pageDesigner.addvalidaterRule')"
      centered
      width="840px"
      :maskClosable="false"
      :afterClose="closeModal"
      @ok="handleOk"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :wrapper-col="{ span: 18 }"
        :label-col="{ span: 4 }"
        autocomplete="off"
        :colon="false"
      >
        <a-form-item
          name="ruleName"
          :label="$t('sys.pageDesigner.ruleName')"
          :rules="[{ required: true }]"
        >
          <a-input
            v-model:value="formState.ruleName"
            placeholder="请输入"
            show-count
            :maxlength="32"
          />
        </a-form-item>
        <a-form-item
          name="jsName"
          :label="$t('sys.pageDesigner.verificationConditions')"
          :rules="[{ required: true }]"
        >
          <div class="pt5px">
            <a-form-item-rest>
              <a-radio-group v-model:value="formState.ruleType" class="mb5px">
                <a-radio :value="VERIFICATIONCONDITIONS_TYPE.JS">
                  {{ $t('sys.pageDesigner.jsEvent') }}</a-radio
                >
              </a-radio-group>
            </a-form-item-rest>
          </div>
          <div class="ks-row mt8px">
            <div class="w160px">
              <a-form-item-rest>
                <a-select
                  v-model:value="formState.field"
                  show-search
                  :placeholder="$t('sys.chooseText')"
                >
                  <a-select-option
                    v-for="field in options"
                    :key="field.key"
                    :value="field.key"
                    :name="field.name"
                  >
                    {{ field.name }}
                  </a-select-option>
                </a-select>
              </a-form-item-rest>
            </div>
            <span class="pl5px pr5px h32px ks-row-middle">
              {{ $t('sys.pageDesigner.valichange') }}</span
            >
            <a-input
              @click="useEvent"
              class="ks-col"
              :value="formState.jsName"
              :placeholder="$t('sys.pageDesigner.pleaseBindEvent')"
              :allow-clear="false"
              readonly
            />
          </div>
        </a-form-item>
      </a-form>
    </basic-modal>
  </div>
</template>

<script setup lang="ts" name="validate-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import commonDraggableList from '../../components/commonDraggableList.vue';
  import { validateRule } from '/@page-designer/types/widget-basic-types';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { ref, onMounted } from 'vue';
  import { VERIFICATIONCONDITIONS_TYPE, EventCategory } from '/@page-designer/enum';
  import { useEventPicker } from '/@page-designer/designer/panels/widget/event-modules/functional';
  import type { FormInstance } from 'ant-design-vue';
  import { FIELD_TYPE, CreateType } from '/@/enums/appEnum';

  const showFiled = [
    FIELD_TYPE.USER_MULTI,
    FIELD_TYPE.USER,
    FIELD_TYPE.ATTACHMENT,
    FIELD_TYPE.BOOLEAN,
    FIELD_TYPE.DATE,
    FIELD_TYPE.DATE_TIME,
    FIELD_TYPE.DECIMAL,
    FIELD_TYPE.DOUBLE,
    FIELD_TYPE.ENUM,
    FIELD_TYPE.ENUM_MULTI,
    FIELD_TYPE.IMAGE,
    FIELD_TYPE.INTEGER,
    FIELD_TYPE.TRANSACTION,
    FIELD_TYPE.TIME,
    FIELD_TYPE.TEXT,
    FIELD_TYPE.REF_MULTI,
    FIELD_TYPE.RDO_REF,
    FIELD_TYPE.REF,
    FIELD_TYPE.ORG_MULTI,
    FIELD_TYPE.ORG,
    FIELD_TYPE.LONG_TEXT,
    FIELD_TYPE.LONG,
    FIELD_TYPE.E_DHR_TEMPLATE,
    FIELD_TYPE.ONLINE_FORM_TEMPLATE,
  ];
  const defProps = defineProps(props);
  const formRef = ref<FormInstance>();
  const { propValue } = usePropEditor<validateRule[]>(defProps.propName, defProps.changeCallback);
  const model_Key = defProps.propConfig.modelKey;
  const [registerInner, { openModal, closeModal }] = useModal();
  const { openPickerEvent } = useEventPicker();
  const formState = ref<Partial<validateRule>>({
    ruleType: VERIFICATIONCONDITIONS_TYPE.JS,
    field: '',
  });
  /**保存回调 */
  const saveCallback = ref(() => {});
  const fieltoptions = ref([]);
  const options = ref([]);
  const addRule = async () => {
    if (!propValue.value) {
      propValue.value = [];
    }
    await openModal();
    formRef.value!.resetFields();
    const list = propValue.value || [];
    options.value = fieltoptions.value.filter((i) => !list.find((j) => j.field === i.key));
    formState.value.field = options.value[0]?.key;
    saveCallback.value = () => {
      propValue.value.push({ ...(formState.value as validateRule) });
    };
  };

  const editRule = (row, index) => {
    if (formRef.value) {
      formRef.value!.resetFields();
    }

    formState.value = { ...row };
    const list = propValue.value || [];
    options.value = fieltoptions.value.filter(
      (i) => !list.find((j) => j.field === i.key) || i.key === formState.value.field,
    );
    openModal();
    saveCallback.value = () => {
      propValue.value.splice(index, 1, { ...(formState.value as validateRule) });
    };
  };
  const handleOk = async () => {
    await formRef.value!.validate();
    saveCallback.value();
    formRef.value!.resetFields();
    closeModal();
  };
  const useEvent = () => {
    openPickerEvent({
      eventType: '',
      params: ['value', 'formData'],
      hiddenEventCategory: [EventCategory.INNER, EventCategory.LO],
    }).then(({ event }) => {
      formState.value.extParams = event.extParams;
      formState.value.jsName = event.methodName;
      formRef.value!.validateFields(['jsName']);
    });
  };
  onMounted(async () => {
    let list = await getFieldMetaList({ modelKey: defProps.widget?.props[model_Key] });
    fieltoptions.value = list?.filter(
      (i) =>
        showFiled.includes(i.type) &&
        [CreateType.USER_DEFINED, CreateType.BUILTIN].includes(i.createType as CreateType),
    );
  });
</script>

<style lang="less" scoped></style>
