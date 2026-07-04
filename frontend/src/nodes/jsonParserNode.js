import { useState } from 'react';
import { BaseNode, NodeField, NodeTextInput } from './baseNode';

export const JsonParserNode = ({ id, data }) => {
  const [path, setPath] = useState(data?.path || 'result');

  const handles = [
    {
      type: 'target',
      position: 'left',
      id: `${id}-json`,
    },
    {
      type: 'source',
      position: 'right',
      id: `${id}-value`,
    },
    {
      type: 'source',
      position: 'right',
      id: `${id}-error`,
    },
  ];

  return (
    <BaseNode
      id={id}
      title="JSON Parser"
      description="Extracts a field from JSON text."
      handles={handles}
    >
      <NodeField label="Path">
        <NodeTextInput value={path} onChange={setPath} placeholder="user.name" />
      </NodeField>
    </BaseNode>
  );
};
