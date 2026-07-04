import { useState } from 'react';
import { BaseNode, NodeField, NodeSelect } from './baseNode';

export const DebugNode = ({ id, data }) => {
  const [format, setFormat] = useState(data?.format || 'pretty');

  const handles = [
    {
      type: 'target',
      position: 'left',
      id: `${id}-value`,
    },
  ];

  return (
    <BaseNode
      id={id}
      title="Debug"
      description="Terminal node for inspecting pipeline values."
      handles={handles}
    >
      <NodeField label="Display">
        <NodeSelect
          value={format}
          onChange={setFormat}
          options={[
            { value: 'pretty', label: 'Pretty print' },
            { value: 'raw', label: 'Raw text' },
            { value: 'json', label: 'JSON' },
          ]}
        />
      </NodeField>
    </BaseNode>
  );
};
