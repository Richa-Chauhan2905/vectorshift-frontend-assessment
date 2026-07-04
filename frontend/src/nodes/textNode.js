import { useMemo, useState } from 'react';
import { BaseNode, NodeField, NodeTextInput } from './baseNode';
import { useStore } from '../store';

const getVariableNames = (text) => {
  const variableNames = [];
  const variablePattern = /\{\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\}\}/g;
  let match;

  while ((match = variablePattern.exec(text || '')) !== null) {
    if (!variableNames.includes(match[1])) {
      variableNames.push(match[1]);
    }
  }

  return variableNames;
};

export const TextNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const [currText, setCurrText] = useState(data?.text ?? '');

  const handleTextChange = (value) => {
    setCurrText(value);
    updateNodeField(id, 'text', value);
  };

  const variableNames = useMemo(() => getVariableNames(currText), [currText]);
  const handles = useMemo(() => [
    {
      type: 'source',
      position: 'right',
      id: `${id}-output`,
    },
    ...variableNames.map((variableName) => ({
      type: 'target',
      position: 'left',
      id: `${id}-${variableName}`,
      label: variableName,
    })),
  ], [id, variableNames]);

  return (
    <BaseNode id={id} title="Text" handles={handles}>
      <NodeField label="Text">
        <NodeTextInput value={currText} onChange={handleTextChange} />
      </NodeField>
    </BaseNode>
  );
};
