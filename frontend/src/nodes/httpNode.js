import { useState } from 'react';
import { BaseNode, NodeField, NodeSelect, NodeTextInput } from './baseNode';

export const HttpNode = ({ id, data }) => {
  const [method, setMethod] = useState(data?.method || 'GET');
  const [url, setUrl] = useState(data?.url || 'https://api.example.com/data');

  const handles = [
    {
      type: 'target',
      position: 'left',
      id: `${id}-body`,
    },
    {
      type: 'source',
      position: 'right',
      id: `${id}-response`,
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
      title="HTTP"
      description="Represents a request to any URL."
      handles={handles}
    >
      <NodeField label="Method">
        <NodeSelect
          value={method}
          onChange={setMethod}
          options={[
            { value: 'GET', label: 'GET' },
            { value: 'POST', label: 'POST' },
            { value: 'PUT', label: 'PUT' },
            { value: 'PATCH', label: 'PATCH' },
            { value: 'DELETE', label: 'DELETE' },
          ]}
        />
      </NodeField>
      <NodeField label="URL">
        <NodeTextInput value={url} onChange={setUrl} placeholder="https://..." />
      </NodeField>
    </BaseNode>
  );
};
