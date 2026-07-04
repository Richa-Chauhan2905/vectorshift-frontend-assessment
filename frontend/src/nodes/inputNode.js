import { useState } from 'react';
import { BaseNode, NodeField, NodeSelect, NodeTextInput } from './baseNode';

export const InputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(data?.inputName || id.replace('customInput-', 'input_'));
  const [inputType, setInputType] = useState(data?.inputType || 'Text');

  const handles = [
    {
      type: 'source',
      position: 'right',
      id: `${id}-value`,
    },
  ];

  return (
    <BaseNode id={id} title="Input" handles={handles}>
      <NodeField label="Name">
        <NodeTextInput value={currName} onChange={setCurrName} />
      </NodeField>
      <NodeField label="Type">
        <NodeSelect
          value={inputType}
          onChange={setInputType}
          options={[
            { value: 'Text', label: 'Text' },
            { value: 'File', label: 'File' },
          ]}
        />
      </NodeField>
    </BaseNode>
  );
};
