import { useMemo, useState } from 'react';
import { BaseNode, NodeField, NodeSelect, NodeTextInput } from './baseNode';
import { useStore } from '../store';

export const MergeNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const [mode, setMode] = useState(data?.mode || 'concat');
  const [firstValue, setFirstValue] = useState(data?.firstValue || 'Hello');
  const [secondValue, setSecondValue] = useState(data?.secondValue || 'World');

  const handleModeChange = (value) => {
    setMode(value);
    updateNodeField(id, 'mode', value);
  };

  const handleFirstValueChange = (value) => {
    setFirstValue(value);
    updateNodeField(id, 'firstValue', value);
  };

  const handleSecondValueChange = (value) => {
    setSecondValue(value);
    updateNodeField(id, 'secondValue', value);
  };

  const preview = useMemo(() => {
    if (mode === 'json') {
      try {
        const first = JSON.parse(firstValue);
        const second = JSON.parse(secondValue);
        return JSON.stringify({ first, second }, null, 2);
      } catch (error) {
        return JSON.stringify({ first: firstValue, second: secondValue }, null, 2);
      }
    }

    if (mode === 'list') {
      return `[${JSON.stringify(firstValue)}, ${JSON.stringify(secondValue)}]`;
    }

    return `${firstValue}${secondValue}`;
  }, [firstValue, mode, secondValue]);

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
          onChange={handleModeChange}
          options={[
            { value: 'concat', label: 'Concatenate' },
            { value: 'json', label: 'JSON object' },
            { value: 'list', label: 'List' },
          ]}
        />
      </NodeField>
      <NodeField label="First value">
        <NodeTextInput value={firstValue} onChange={handleFirstValueChange} placeholder="First input" />
      </NodeField>
      <NodeField label="Second value">
        <NodeTextInput value={secondValue} onChange={handleSecondValueChange} placeholder="Second input" />
      </NodeField>
      <div style={{ fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap' }}>
        <strong>Preview:</strong>
        {'\n'}
        {preview}
      </div>
    </BaseNode>
  );
};
