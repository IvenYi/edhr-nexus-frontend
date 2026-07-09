import { defineComponent, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { nodeEditorProps as props } from '../../../props';
import './upload-file.scss';

export const UploadFile = defineComponent({
  name: 'UploadFile',
  props,
  setup() {
    const ns = useNamespace('design-editor-upload-file');
    const tab = ref(true);
    return () => {
      return (
        <div class={ns.b()}>
          <div class={ns.e('actions')}>
            <div
              class={[ns.e('action-item'), ns.is('active', tab.value)]}
              onClick={() => (tab.value = true)}
            >
              <i class="iconfont icon-liebiaozhanshi" />
            </div>
            <div
              onClick={() => (tab.value = false)}
              class={[ns.e('action-item'), ns.is('active', !tab.value)]}
            >
              <i class="iconfont icon-kapianzhanshi" />
            </div>
          </div>
          {tab.value ? (
            <div class={ns.e('file-list')}>
              <div class={ns.e('file-item')}>
                <span class={ns.em('file-item', 'icon')}>
                  <svg-icon src="/assets/card-design/attachment.svg" />
                </span>
                <span class={ns.em('file-item', 'name')}>示例内容.docx</span>
              </div>
              <div class="text-[#c3c3c3]">83.92M</div>
            </div>
          ) : (
            <div class={ns.e('file-card')}>
              <svg-icon class="text-32px mt12px" src="/assets/card-design/attachment.svg" />
              <div>示例内容.docx</div>
              <div class="text-[#c3c3c3] mt4px">83.92M</div>
            </div>
          )}
        </div>
      );
    };
  },
});
