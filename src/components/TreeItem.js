'use client';
export default function TreeItem({node, onSelect}) {
  return (
    <li className="mt-1">
      <button
        className="text-left hover:underline"
        onClick={() => onSelect(node.id)}
      >
        {node.name}
      </button>
      {node.children?.length > 0 && (
        <ul className="pl-4">
          {node.children.map((child) => (
            <TreeItem key={child.id} node={child} onSelect={onSelect}/>
          ))}
        </ul>
      )}
    </li>
  );
}
