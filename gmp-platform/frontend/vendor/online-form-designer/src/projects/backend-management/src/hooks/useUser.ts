import { ref } from 'vue';
import { getUserList } from '/@backend-management/api/org-user/user';
const userList = ref<any[]>([]);

export function useUser() {
  async function getUserListByKey(searchKey?: string) {
    userList.value = await getUserList(searchKey);
    return userList.value;
  }
  return {
    getUserListByKey,
  };
}

export default useUser;
