import { useState } from 'react';
import { BaseNode, NodeField, NodeSelect, NodeTextInput } from './baseNode';

export const FilterNode = ({ id, data }) => {
  const [condition, setCondition] = useState(data?.condition || 'contains');
  const [value, setValue] = useState(data?.value || '');

  const handles = [
    {
      type: 'target',
      position: 'left',
      id: `${id}-input`,
    },
    {
      type: 'source',
      position: 'right',
      id: `${id}-match`,
    },
    {
      type: 'source',
      position: 'right',
      id: `${id}-reject`,
    },
  ];

  return (
    <BaseNode
      id={id}
      title="Filter"
      description="Routes data based on a simple condition."
      handles={handles}
    >
      <NodeField label="Condition">
        <NodeSelect
          value={condition}
          onChange={setCondition}
          options={[
            { value: 'contains', label: 'Contains' },
            { value: 'equals', label: 'Equals' },
            { value: 'notEmpty', label: 'Is not empty' },
          ]}
        />
      </NodeField>
      <NodeField label="Value">
        <NodeTextInput value={value} onChange={setValue} placeholder="keyword or value" />
      </NodeField>
    </BaseNode>
  );
};
