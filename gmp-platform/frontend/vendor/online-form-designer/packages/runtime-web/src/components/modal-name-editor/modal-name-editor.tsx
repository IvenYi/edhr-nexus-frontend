import { computed, defineComponent, nextTick, ref, watch } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { onClickOutside } from '@vueuse/core';
import './modal-name-editor.scss';
import { useReportDataSetDesignStore } from '../report-data-set-design/store';
import { useReportViewController } from '../report-design/hooks';

export const ModalNameEditor = defineComponent({
  name: 'ModalNameEditor',
  props: {
    value: {
      type: String,
      default: '未命名',
    },
    defaultName: {
      type: String,
      default: '未命名名称',
    },
    // save: {
    //   type: Function as PropType<(name: string) => Promise<void>>,
    //   required: true,
    // },
    max: {
      type: Number,
      default: 100,
    },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const ns = useNamespace('modal-name-editor');
    const store = useReportDataSetDesignStore();
    // 是否正在编辑
    const isEdit = ref<boolean>(false);
    // 开始编辑时，记录旧值
    // const oldVal = ref<string>('');\
    // 报表设计界面总控制器
    const c = useReportViewController();
    // 输入框实例
    const nameInputRef = ref<any>();
    // 输入框的值
    const name = ref<string>(props.value);
    // 显示的名称（可能是 defaultName）
    const displayName = computed(() => {
      return name.value || props.defaultName;
    });
    const isError = computed(() => {
      if (displayName.value.length > props.max) {
        return true;
      }
      return false;
    });
    // 输入值发生变更时，重新赋值组件内编辑
    watch(
      () => props.value,
      () => {
        if (name.value !== props.value) {
          name.value = props.value;
        }
      },
    );
    // 是否正在保存
    const isSaving = ref<boolean>(false);
    // 用户是否已经开始修改（用于区分是否还应该显示默认名称）
    const hasUserModified = ref<boolean>(false);
    // val
    const val = computed({
      get() {
        // 如果正在编辑且用户已经修改过，则直接显示 name.value（即使为空）
        if (isEdit.value && hasUserModified.value) {
          return name.value;
        }
        return displayName.value;
      },
      set(val) {
        hasUserModified.value = true; // 标记用户已经修改
        const trimmedVal = val.trim();
        if (name.value !== trimmedVal) {
          name.value = trimmedVal;
          emit('update:value', trimmedVal);
        }
      },
    });
    // 开启编辑
    const onEditName = () => {
      // oldVal.value = val.value;
      isEdit.value = true;
      hasUserModified.value = false; // 重置修改标记
      nextTick(() => {
        nameInputRef.value.focus();
        nameInputRef.value.select();
      });
    };
    // 保存编辑
    const onSaveName = async () => {
      // 只有当名称不为空且不是使用默认名称时才保存
      if (name.value && name.value.trim()) {
        isSaving.value = true;
        try {
          // await props.save(name.value);
          emit('update:value', name.value);
        } finally {
          isSaving.value = false;
        }
      }
      isEdit.value = false;
      hasUserModified.value = false; // 重置修改标记
    };
    // 触发保存
    const onBlurOrEnter = () => {
      if (isEdit.value) {
        if (isError.value === true) {
          nextTick(() => {
            nameInputRef.value.focus();
            nameInputRef.value.select();
          });
          return;
        }

        onSaveName();
        isEdit.value = false;
      }
    };
    // 点击外面时，关闭编辑
    onClickOutside(nameInputRef, async () => {
      onBlurOrEnter();
    });

    const onChange = () => {
      c.state.modified = true;
      store.isChanged = true;
    };
    return {
      ns,
      isEdit,
      isError,
      isSaving,
      val,
      nameInputRef,
      onEditName,
      onBlurOrEnter,
      onChange,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div
          class={[this.ns.e('name'), this.ns.is('hidden', this.isEdit)]}
          title={this.val}
          onDblclick={this.onEditName}
        >
          {this.val}
        </div>
        <div class={[this.ns.e('input'), this.ns.is('hidden', !this.isEdit)]}>
          {this.isSaving ? <loading-outlined /> : null}
          <a-input
            v-model:value={this.val}
            ref="nameInputRef"
            size="small"
            bordered={false}
            onBlur={this.onBlurOrEnter}
            onPressEnter={this.onBlurOrEnter}
            disabled={this.isSaving}
            onChange={this.onChange}
          />
          <div
            class={[this.ns.e('error-info'), this.ns.is('hidden', !this.isError)]}
          >{`最大${this.max}字`}</div>
        </div>
        <div
          class={[this.ns.e('edit'), this.ns.is('hidden', this.isEdit)]}
          onClick={this.onEditName}
        >
          <i class="iconfont icon-bianji" />
        </div>
      </div>
    );
  },
});
