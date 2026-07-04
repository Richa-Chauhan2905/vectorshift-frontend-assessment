import { useState } from 'react';
import { BaseNode, NodeField, NodeSelect, NodeTextInput } from './baseNode';

export const OutputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(data?.outputName || id.replace('customOutput-', 'output_'));
  const [outputType, setOutputType] = useState(data?.outputType || 'Text');

  const handles = [
    {
      type: 'target',
      position: 'left',
      id: `${id}-value`,
    },
  ];

  return (
    <BaseNode id={id} title="Output" handles={handles}>
      <NodeField label="Name">
        <NodeTextInput value={currName} onChange={setCurrName} />
      </NodeField>
      <NodeField label="Type">
        <NodeSelect
          value={outputType}
          onChange={setOutputType}
          options={[
            { value: 'Text', label: 'Text' },
            { value: 'Image', label: 'Image' },
          ]}
        />
      </NodeField>
    </BaseNode>
  );
};
