import React from 'react';

import { IconMap } from '../../../../types';
import { TreeNode } from '../../../utils/tree-utils';
import { TreeItem } from './TreeItem';

interface TreeViewProps {
  nodes: TreeNode[];
  expanded: Set<string>;
  iconMap: IconMap | null;
  onToggle: (path: string, recursive: boolean) => void;
  onOpen: (path: string) => void;
}

export const TreeView: React.FC<TreeViewProps> = ({ nodes, expanded, iconMap, onToggle, onOpen }) => {
  return (
    <div className='flex h-full flex-col overflow-x-hidden overflow-y-auto pt-1.5'>
      {nodes.map((node, i) => (
        <TreeItem
          key={i}
          node={node}
          depth={0}
          expanded={expanded}
          iconMap={iconMap}
          onToggle={onToggle}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
};
