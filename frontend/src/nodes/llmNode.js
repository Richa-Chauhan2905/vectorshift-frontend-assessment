import { useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';
import { BaseNode, NodeField, NodeRange, NodeSelect, NodeTextarea } from './baseNode';
import { useStore } from '../store';

const selector = (state) => ({
  updateNodeField: state.updateNodeField,
});

export const LLMNode = ({ id, data }) => {
  const { updateNodeField } = useStore(selector, shallow);
  const [model, setModel] = useState(data?.model || 'gpt-4o-mini');
  const [systemPrompt, setSystemPrompt] = useState(
    data?.systemPrompt || 'You are a helpful assistant.'
  );
  const [temperature, setTemperature] = useState(data?.temperature ?? 0.7);

  useEffect(() => {
    updateNodeField(id, 'model', model);
    updateNodeField(id, 'systemPrompt', systemPrompt);
    updateNodeField(id, 'temperature', temperature);
  }, [id, model, systemPrompt, temperature, updateNodeField]);

  const updateField = (fieldName, fieldValue, setter) => {
    setter(fieldValue);
    updateNodeField(id, fieldName, fieldValue);
  };

  const handles = [
    {
      type: 'target',
      position: 'left',
      id: `${id}-system`,
    },
    {
      type: 'target',
      position: 'left',
      id: `${id}-prompt`,
    },
    {
      type: 'source',
      position: 'right',
      id: `${id}-response`,
    },
  ];

  return (
    <BaseNode
      id={id}
      title="LLM"
      description="Configures how prompt inputs should be answered."
      handles={handles}
      className="base-node--wide"
    >
      <NodeField label="Model">
        <NodeSelect
          value={model}
          onChange={(value) => updateField('model', value, setModel)}
          options={[
            { value: 'gpt-4o-mini', label: 'GPT-4o mini' },
            { value: 'gpt-4o', label: 'GPT-4o' },
            { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
            { value: 'custom', label: 'Custom model' },
          ]}
        />
      </NodeField>
      <NodeField label="System prompt">
        <NodeTextarea
          value={systemPrompt}
          onChange={(value) => updateField('systemPrompt', value, setSystemPrompt)}
          placeholder="Instructions for the assistant"
          rows={3}
        />
      </NodeField>
      <NodeField label="Temperature">
        <NodeRange
          value={temperature}
          onChange={(value) => updateField('temperature', value, setTemperature)}
          min={0}
          max={2}
          step={0.1}
        />
      </NodeField>
    </BaseNode>
  );
};
