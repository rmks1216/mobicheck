export function buildIdNameMap(tree, map = {}) {
  tree.forEach((n) => {
    map[n.id] = n.name;
    if (n.children) buildIdNameMap(n.children, map);
  });
  return map;
}
