import { getAppInfoById } from '/@/apis/gct-platform/AppController';
import { getBizServiceCrudList } from '/@/apis/gct-apaas/BizServiceController';
import { getConnectorConfigFindAppByConnectorId } from '/@/apis/gct-ipaas2/ConnectorConfigController';

// 通过appTag获取应用详情
export async function getAppName(id) {
  if (!id) return;
  const res = await getAppInfoById({ id });
  return res?.name;
}

export async function getBSName(modelKey, key, headers) {
  const res: any = await getBizServiceCrudList(
    { modelKey },
    {
      transferToConfig: {
        headers,
      },
    },
  );
  const bs = res?.find((e) => e.key === key);
  return bs ? `${bs.name}[${bs.key}]` : '';
}

export async function geApiConnectorName(id, headers = {}) {
  const res = await getConnectorConfigFindAppByConnectorId(
    { id },
    {
      transferToConfig: {
        headers,
      },
    },
  );
  return res?.name;
}
