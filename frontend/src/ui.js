// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback, useMemo } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import { FilterNode } from './nodes/filterNode';
import { JsonParserNode } from './nodes/jsonParserNode';
import { MergeNode } from './nodes/mergeNode';
import { HttpNode } from './nodes/httpNode';
import { DebugNode } from './nodes/debugNode';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };
const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  filter: FilterNode,
  jsonParser: JsonParserNode,
  merge: MergeNode,
  http: HttpNode,
  debug: DebugNode,
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  deleteEdge: state.deleteEdge,
});

export const PipelineUI = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState(null);
    const {
      nodes,
      edges,
      getNodeID,
      addNode,
      onNodesChange,
      onEdgesChange,
      onConnect,
      deleteEdge,
    } = useStore(selector, shallow);

    const getInitNodeData = (nodeID, type) => {
      let nodeData = { id: nodeID, nodeType: `${type}` };
      return nodeData;
    }

    const onDrop = (event) => {
          event.preventDefault();
    
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;
      
            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
              return;
            }
      
            const position = reactFlowInstance.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });

            const nodeID = getNodeID(type);
            const newNode = {
              id: nodeID,
              type,
              position,
              data: getInitNodeData(nodeID, type),
            };
      
            addNode(newNode);
          }
        };

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const selectedEdge = useMemo(() => edges.find((edge) => edge.id === selectedEdgeId), [edges, selectedEdgeId]);

    const handleDeleteSelectedEdge = (event) => {
      event.stopPropagation();
      if (selectedEdge) {
        deleteEdge(selectedEdge.id);
        setSelectedEdgeId(null);
      }
    };

    const edgeButtonPosition = useMemo(() => {
      if (!selectedEdge || !reactFlowInstance) {
        return null;
      }

      const sourceNode = nodes.find((node) => node.id === selectedEdge.source);
      const targetNode = nodes.find((node) => node.id === selectedEdge.target);

      if (!sourceNode || !targetNode) {
        return null;
      }

      const sourceX = (sourceNode.position?.x ?? 0) + (sourceNode.width ?? 220) / 2;
      const sourceY = (sourceNode.position?.y ?? 0) + (sourceNode.height ?? 88) / 2;
      const targetX = (targetNode.position?.x ?? 0) + (targetNode.width ?? 220) / 2;
      const targetY = (targetNode.position?.y ?? 0) + (targetNode.height ?? 88) / 2;
      const middleX = (sourceX + targetX) / 2;
      const middleY = (sourceY + targetY) / 2;
      const screenPosition = reactFlowInstance.flowToScreenPosition({ x: middleX, y: middleY });
      const wrapperBounds = reactFlowWrapper.current?.getBoundingClientRect();

      if (!wrapperBounds) {
        return null;
      }

      return {
        left: screenPosition.x - wrapperBounds.left,
        top: screenPosition.y - wrapperBounds.top,
      };
    }, [nodes, reactFlowInstance, selectedEdge]);

    return (
        <>
        <div ref={reactFlowWrapper} style={{width: '100vw', height: 'calc(100vh - 112px)', position: 'relative'}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
                onPaneClick={() => setSelectedEdgeId(null)}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
            >
                <Background color="#aaa" gap={gridSize} />
                <Controls />
                <MiniMap />
            </ReactFlow>
            {selectedEdge && edgeButtonPosition && (
              <button
                type="button"
                onClick={handleDeleteSelectedEdge}
                style={{
                  position: 'absolute',
                  left: edgeButtonPosition.left,
                  top: edgeButtonPosition.top,
                  zIndex: 20,
                  width: '24px',
                  height: '24px',
                  border: 'none',
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  lineHeight: 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
                aria-label="Delete edge"
              >
                ×
              </button>
            )}
        </div>
        </>
    )
}
