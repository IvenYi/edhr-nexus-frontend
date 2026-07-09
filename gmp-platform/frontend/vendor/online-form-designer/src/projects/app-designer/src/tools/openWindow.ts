import { usePathQueryStore } from '/@/store/modules/pathQuery';
import { useBranch } from '/@/hooks/develop/useBranch';
import { openWindow, genUrl } from '/@/utils';

const usePathQuery = usePathQueryStore();
const { branchId } = useBranch();

export default function open(path: string) {
  const { host, protocol } = window.location;
  const url = genUrl(`${protocol}//${host}${import.meta.env.VITE_PATHNAME_APP_DESIGNER}`, {
    aid: usePathQuery.getAid(),
    bid: branchId.value,
  });
  openWindow(url + path, {
    target: '_blank',
  });
}
