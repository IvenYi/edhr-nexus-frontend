import { defineComponent, PropType, ref, watch } from 'vue';
import { cloneDeep } from 'lodash-es';
import {
  useModal,
  useNamespace,
  IEditForm,
  IEditFormController,
  EditFormController,
  useEditFormController,
} from '@gct/runtime';
import './gct-edit-form.scss';

/**
 * 编辑表单组件
 */
export const GctEditForm = defineComponent({
  name: 'GctEditForm',
  props: {
    // 是否为嵌入表单组件
    embed: {
      type: Boolean,
      default: false,
    },
    context: {
      type: Object as PropType<IParams>,
      default: () => ({}),
    },
    params: {
      type: Object as PropType<IParams>,
      default: () => ({}),
    },
    controller: {
      type: Object as PropType<IEditFormController>,
    },
    model: {
      type: Object as PropType<IEditForm>,
      required: true,
    },
    data: {
      type: Object as PropType<IData>,
    },
    count: {
      type: Number,
      default: 0,
    },
    adaptModal: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:data', 'change'],
  setup(props, { emit }) {
    const ns = useNamespace('gct-edit-form');

    const c = props.controller || useEditFormController(() => new EditFormController(props.model));

    const formRef = ref<any>(null);

    const validate = async () => {
      try {
        await formRef.value.formRef.validate();
      } catch (error) {
        return false;
      }
      return true;
    };

    const validateField = async (field: string) => {
      try {
        await formRef.value.formRef.validateFields([field]);
      } catch (error) {
        return false;
      }
      return true;
    };

    c.validate = validate;

    c.validateItem = validateField;

    watch(
      props.context,
      () => {
        Object.assign(c.context, props.context);
        c.state.isNew = !c.context.id;
      },
      { immediate: true },
    );

    watch(props.params, () => {
      Object.assign(c.params, props.params);
    });

    watch(
      () => props.count,
      () => {
        c.state.count += 1;
      },
    );

    watch(
      () => props.data,
      () => {
        Object.assign(c.state.data, props.data);
      },
      { deep: true },
    );

    if (props.adaptModal !== false) {
      useModal(async () => {
        try {
          await formRef.value.formRef.validate();
          const data = await c.save();
          if (data) {
            return {
              ok: true,
              data: [cloneDeep(data)],
            };
          }
        } catch (error) {
          console.error(error);
        }
        return {
          ok: false,
        };
      });
    }
    if (props.data) {
      Object.assign(c.state.data, props.data);
      c.loaded();
    } else if (c.state.isNew !== true) {
      c.load().then(() => {
        c.loaded();
      });
    } else {
      c.loaded();
    }

    if (props.embed) {
      c.evt.on('change', () => {
        const data = c.getData();
        emit('update:data', data);
        emit('change', data);
      });
    }

    c.evt.on('blur', (key) => {
      validateField(key);
    });

    return { ns, c, formRef };
  },
  render() {
    let content: any = null;
    if (this.c.state.isNew || (this.c.state.isNew == false && this.c.state.loaded)) {
      content = (
        <gct-form
          class="h-full"
          ref="formRef"
          model={this.model}
          c={this.c}
          context={this.context}
        />
      );
    }
    return <div class={this.ns.b()}>{content}</div>;
  },
});
