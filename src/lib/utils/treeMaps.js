export function buildMaps(tree) {
  const idNameMap = {};
  const descendantMap = {};   // id -> [모든 하위 id]
  const ancestorMap = {};     // id -> [가까운 부모 → 루트]
  
  function walk(node, ancestors = []) {
    idNameMap[node.id] = node.name;
    ancestorMap[node.id] = ancestors;
    if (node.children?.length) {
      const ids = [];
      node.children.forEach((child) => {
        walk(child, [node.id, ...ancestors]);
        ids.push(child.id, ...(descendantMap[child.id] || []));
      });
      descendantMap[node.id] = ids;
    } else {
      descendantMap[node.id] = [];
    }
  }
  
  tree.forEach((n) => walk(n));
  return {idNameMap, descendantMap, ancestorMap};
}