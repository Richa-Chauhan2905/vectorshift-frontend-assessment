import { useMemo, useState } from 'react';
import { BaseNode, NodeField, NodeSelect, NodeTextarea } from './baseNode';
import { useStore } from '../store';

export const DebugNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const [format, setFormat] = useState(data?.format || 'pretty');
  const [sampleValue, setSampleValue] = useState(data?.sampleValue || '{"user":"Ada"}');

  const handleFormatChange = (value) => {
    setFormat(value);
    updateNodeField(id, 'format', value);
  };

  const handleSampleValueChange = (value) => {
    setSampleValue(value);
    updateNodeField(id, 'sampleValue', value);
  };

  const preview = useMemo(() => {
    if (format === 'json') {
      try {
        return JSON.stringify(JSON.parse(sampleValue), null, 2);
      } catch (error) {
        return sampleValue;
      }
    }

    if (format === 'pretty') {
      try {
        return JSON.stringify(JSON.parse(sampleValue), null, 2);
      } catch (error) {
        return sampleValue;
      }
    }

    return sampleValue;
  }, [format, sampleValue]);

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
          onChange={handleFormatChange}
          options={[
            { value: 'pretty', label: 'Pretty print' },
            { value: 'raw', label: 'Raw text' },
            { value: 'json', label: 'JSON' },
          ]}
        />
      </NodeField>
      <NodeField label="Sample value">
        <NodeTextarea value={sampleValue} onChange={handleSampleValueChange} rows={4} />
      </NodeField>
      <div style={{ fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap' }}>
        <strong>Preview:</strong>
        {'\n'}
        {preview}
      </div>
    </BaseNode>
  );
};
