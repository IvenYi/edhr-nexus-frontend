import { NodeTypeEnum } from '../types';
import { useMessage } from '/@/hooks/web/useMessage';

export function validate({ graphJSON, controls, variables }) {
  const { createMessage } = useMessage();
  const { cells } = graphJSON;
  const start = cells.find((item) => item.shape === NodeTypeEnum.START);
  if (!start) {
    const message = '未找到开始节点';
    createMessage.error(message);
    throw new Error(message);
  }

  const end = cells.find((item) => item.shape === NodeTypeEnum.END);
  if (!end) {
    const message = '未找到结束节点';
    createMessage.error(message);
    throw new Error(message);
  }
}
