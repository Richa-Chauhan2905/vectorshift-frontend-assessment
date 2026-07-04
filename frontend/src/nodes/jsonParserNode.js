import { useMemo, useState } from 'react';
import { BaseNode, NodeField, NodeTextInput, NodeTextarea } from './baseNode';
import { useStore } from '../store';

const getValueAtPath = (value, path) => {
  if (!path) {
    return value;
  }

  return path.split('.').reduce((current, part) => {
    if (current === null || current === undefined) {
      return undefined;
    }

    return current[part];
  }, value);
};

export const JsonParserNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const [path, setPath] = useState(data?.path || 'user.name');
  const [jsonText, setJsonText] = useState(data?.jsonText || '{"user":{"name":"Ada"}}');

  const handlePathChange = (value) => {
    setPath(value);
    updateNodeField(id, 'path', value);
  };

  const handleJsonTextChange = (value) => {
    setJsonText(value);
    updateNodeField(id, 'jsonText', value);
  };

  const preview = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonText);
      const result = getValueAtPath(parsed, path);

      if (result === undefined) {
        return 'No value at this path.';
      }

      return typeof result === 'string' ? result : JSON.stringify(result);
    } catch (error) {
      return 'Enter valid JSON to preview a value.';
    }
  }, [jsonText, path]);

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
        <NodeTextInput value={path} onChange={handlePathChange} placeholder="user.name" />
      </NodeField>
      <NodeField label="Sample JSON">
        <NodeTextarea value={jsonText} onChange={handleJsonTextChange} rows={4} />
      </NodeField>
      <div style={{ fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap' }}>
        <strong>Preview:</strong>
        {'\n'}
        {preview}
      </div>
    </BaseNode>
  );
};
