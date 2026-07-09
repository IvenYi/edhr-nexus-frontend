import { defineComponent, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { nodeEditorProps as props } from '@gct/runtime-render';
import { postFileResourceList } from '/@/apis/gct-apaas/FileResourceController';
import './upload-file.scss';

export const UploadFile = defineComponent({
  name: 'UploadFile',
  props,
  setup(props) {
    const ns = useNamespace('render-design-editor-upload-file');

    const files = ref<IObject[]>([]);

    async function onInit(): Promise<void> {
      if (props.value) {
        const filePaths = props.value.split(',');
        const ids = filePaths.map((i) => {
          return i.split('/')[2];
        });
        files.value = (await postFileResourceList({ ids })) || [];
        files.value = files.value.map((file) => {
          if (!file.size) {
            file.size = 0;
          }
          file.size = sizeParser(file.size);
          return file;
        });
      }
    }

    function sizeParser(size): string {
      if (size / 1024 < 1) return (size / 1024).toFixed(2) + 'K';
      if (size / 1024 / 10 < 1) return (size / 1024).toFixed(1) + 'K';
      if (size / 1024 / 1024 < 1) return (size / 1024).toFixed(0) + 'K';
      if (size / 1024 / 1024 / 10 < 1) return (size / 1024 / 1024).toFixed(2) + 'M';
      return (size / 1024 / 1024).toFixed(2) + 'M';
    }

    try {
      onInit();
    } catch (error) {
      console.error('Error in UploadFile component:', error);
    }

    return () => {
      return (
        <div class={ns.b()}>
          {files.value.map((file) => {
            return (
              <div class={ns.e('file-item')}>
                <span class={ns.em('file-item', 'name')}>{file.name}</span>
                <span class={ns.em('file-item', 'size')}>{file.size }</span>
              </div>
            );
          })}
        </div>
      );
    };
  },
});
