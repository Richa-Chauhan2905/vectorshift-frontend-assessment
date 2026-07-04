import { useState } from 'react';
import { BaseNode, NodeField, NodeSelect } from './baseNode';

export const MergeNode = ({ id, data }) => {
  const [mode, setMode] = useState(data?.mode || 'concat');

  const handles = [
    {
      type: 'target',
      position: 'left',
      id: `${id}-first`,
    },
    {
      type: 'target',
      position: 'left',
      id: `${id}-second`,
    },
    {
      type: 'source',
      position: 'right',
      id: `${id}-merged`,
    },
  ];

  return (
    <BaseNode
      id={id}
      title="Merge"
      description="Combines two inputs into one downstream value."
      handles={handles}
    >
      <NodeField label="Mode">
        <NodeSelect
          value={mode}
          onChange={setMode}
          options={[
            { value: 'concat', label: 'Concatenate' },
            { value: 'json', label: 'JSON object' },
            { value: 'list', label: 'List' },
          ]}
        />
      </NodeField>
    </BaseNode>
  );
};
