import { IModalData } from '@gct/runtime';
import { WidgetEditorModal } from '.';
import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
import { cloneDeep } from 'lodash-es';

export async function editWidget() {
  const { selectedRef } = useSelectedWidget();
  if (!selectedRef.value) {
    return;
  }
  const widget = cloneDeep(selectedRef.value);
  const res = await gct.openUtil.modal<IModalData>(
    WidgetEditorModal,
    {
      widget,
    },
    {
      title: '修改页面配置',
      width: '80%',
      height: '80%',
      zIndex: 99999,
    },
  );
  if (res.ok) {
    // 处理保存逻辑
    const newJson = res.data![0];
    Object.assign(selectedRef.value, newJson);
  }
}
