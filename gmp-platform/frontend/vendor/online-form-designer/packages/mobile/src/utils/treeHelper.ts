export function list_to_tree(list: any[], callBack: any = (n: any) => n) {
  const map: any = {},
    roots: any[] = [];
  for (let i = 0; i < list.length; i++) {
    map[list[i].id] = i;
    list[i].children = [];
  }
  for (let i = 0; i < list.length; i++) {
    const node = list[i];
    if (node.parentId === 'ROOT' || !node.parentId) {
      roots.push(callBack(node));
    } else {
      const parent = list[map[node.parentId]];
      if (parent) {
        parent.children!.push(callBack(node, parent));
      }
    }
  }
  return roots;
}
