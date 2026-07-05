import { useState } from 'react';
import { AlertTriangle, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { shallow } from 'zustand/shallow';
import { useStore } from './store';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
});

const Stat = ({ label, value }) => (
  <div className="submit-stat">
    <span className="submit-stat__label">{label}</span>
    <strong>{value}</strong>
  </div>
);

export const SubmitButton = () => {
  const { nodes, edges } = useStore(selector, shallow);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    setResult(null);

    try {
      const nodeIds = new Set((nodes || []).map((node) => node?.id).filter(Boolean));
      const validEdges = (edges || []).filter((edge) => {
        const hasSource = Boolean(edge?.source);
        const hasTarget = Boolean(edge?.target);

        return hasSource && hasTarget && nodeIds.has(edge.source) && nodeIds.has(edge.target);
      });

      const response = await fetch('http://localhost:8000/pipelines/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodes, edges: validEdges }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || data?.error || `Backend returned ${response.status}`);
      }

      setResult(data);
    } catch (requestError) {
      setError(
        'Could not analyze the pipeline. Make sure the FastAPI backend is running on http://localhost:8000.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasPipelineErrors = result && !result.is_valid_pipeline;

  return (
    <div className="submit-panel">
      <button
        className="submit-button"
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? <Loader2 className="submit-button__icon is-spinning" size={16} /> : null}
        {isSubmitting ? 'Analyzing...' : 'Submit Pipeline'}
      </button>

      {error && (
        <div className="submit-result submit-result--error">
          <XCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className={hasPipelineErrors ? 'submit-result submit-result--error' : 'submit-result submit-result--success'}>
          {hasPipelineErrors ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
          <div className="submit-result__body">
            <div className="submit-result__title">
              {hasPipelineErrors ? 'Pipeline needs attention' : 'Pipeline is valid'}
            </div>
            <div className="submit-stats">
              <Stat label="Nodes" value={result.num_nodes} />
              <Stat label="Edges" value={result.num_edges} />
              <Stat label="DAG" value={result.is_dag ? 'Yes' : 'No'} />
              <Stat label="Pipeline" value={result.is_valid_pipeline ? 'Valid' : 'Invalid'} />
            </div>
            {result.errors?.length > 0 && (
              <ul className="submit-errors">
                {result.errors.map((pipelineError) => (
                  <li key={pipelineError}>{pipelineError}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
