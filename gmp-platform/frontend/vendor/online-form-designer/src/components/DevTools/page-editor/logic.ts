import { IModalData } from '@gct/runtime';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { PageEditorModal } from '.';

export async function editPage() {
  const { pageJson, setPageJson } = useDesigner();
  console.log('pageJson', pageJson);
  const res = await gct.openUtil.modal<IModalData>(
    PageEditorModal,
    {
      pageJson,
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
    setPageJson(newJson);
  }
}
