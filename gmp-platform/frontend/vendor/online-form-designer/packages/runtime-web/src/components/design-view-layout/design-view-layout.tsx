import { defineComponent, ref, watch } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { ModalNameEditor } from '../modal-name-editor/modal-name-editor';
import './design-view-layout.scss';

export const DesignViewLayout = defineComponent({
  name: 'DesignViewLayout',
  props: {
    subTitle: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
    leftPanelExpanded: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:name', 'close', 'changeName'],
  setup(props, { emit }) {
    const ns = useNamespace('design-view-layout');

    const nameVal = ref<string>(props.name);

    watch(
      () => props.name,
      () => {
        if (nameVal.value !== props.name) {
          nameVal.value = props.name;
        }
      },
    );

    watch(nameVal, () => {
      emit('update:name', nameVal.value);
    });

    async function onSaveName(): Promise<void> {
      emit('update:name', nameVal.value);
      emit('changeName', nameVal.value);
    }

    async function onClose(): Promise<void> {
      emit('close');
    }

    return { ns, nameVal, onSaveName, onClose };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('header')}>
          <div class={this.ns.e('header-left')}>
            <span class={this.ns.em('header', 'icon')} onClick={this.onClose}>
              <i class="iconfont icon-a-Leftarrow" />
            </span>
            <span class={this.ns.em('header', 'title')}>
              <div class={this.ns.em('header', 'report-categorize')}>{this.subTitle}</div>
              <div class={this.ns.e('report-info')}>
                <ModalNameEditor
                  v-model:value={this.nameVal}
                  // save={this.onSaveName}
                />
              </div>
            </span>
            {this.$slots.headerLeft?.()}
          </div>
          {this.$slots.headerCenter ? (
            <div class={this.ns.e('header-center')}>{this.$slots.headerCenter()}</div>
          ) : null}
          <div class={this.ns.e('header-right')}>{this.$slots.headerRight?.()}</div>
        </div>
        <div class={this.ns.e('body')}>
          {this.$slots.bodyLeft ? (
            <div class={[this.ns.e('body-left'), this.ns.is('collapsed', !this.leftPanelExpanded)]}>
              {this.$slots.bodyLeft()}
            </div>
          ) : null}
          <div class={[this.ns.e('body-center'), this.ns.is('expanded', !this.leftPanelExpanded)]}>
            {this.$slots.default?.()}
          </div>
          {this.$slots.bodyRight ? (
            <div class={this.ns.e('body-right')}>{this.$slots.bodyRight()}</div>
          ) : null}
        </div>
      </div>
    );
  },
});
