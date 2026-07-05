// store.js

import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';

const getNodeIds = (nodes = []) => new Set(
  nodes
    .map((node) => node?.id)
    .filter(Boolean)
);

const sanitizeEdges = (nodes = [], edges = []) => {
  const nodeIds = getNodeIds(nodes);

  return edges.filter((edge) => {
    const hasSource = Boolean(edge?.source);
    const hasTarget = Boolean(edge?.target);

    return hasSource && hasTarget && nodeIds.has(edge.source) && nodeIds.has(edge.target);
  });
};

export const useStore = create(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      nodeIDs: {},
      getNodeID: (type) => {
          const newIDs = {...get().nodeIDs};
          if (newIDs[type] === undefined) {
              newIDs[type] = 0;
          }
          newIDs[type] += 1;
          set({nodeIDs: newIDs});
          return `${type}-${newIDs[type]}`;
      },
      addNode: (node) => {
          set({
              nodes: [...get().nodes, node]
          });
      },
      onNodesChange: (changes) => {
        const nextNodes = applyNodeChanges(changes, get().nodes);
        set({
          nodes: nextNodes,
          edges: sanitizeEdges(nextNodes, get().edges),
        });
      },
      onEdgesChange: (changes) => {
        const nextEdges = applyEdgeChanges(changes, get().edges);
        set({
          edges: sanitizeEdges(get().nodes, nextEdges),
        });
      },
      onConnect: (connection) => {
        if (!connection?.source || !connection?.target) {
          return;
        }

        const nodeIds = getNodeIds(get().nodes);
        if (!nodeIds.has(connection.source) || !nodeIds.has(connection.target)) {
          return;
        }

        set({
          edges: addEdge({...connection, type: 'smoothstep', animated: true, markerEnd: {type: MarkerType.Arrow, height: '20px', width: '20px'}}, sanitizeEdges(get().nodes, get().edges)),
        });
      },
      deleteEdge: (edgeId) => {
        set({
          edges: get().edges.filter((edge) => edge.id !== edgeId),
        });
      },
      deleteNode: (nodeId) => {
        set({
          nodes: get().nodes.filter((node) => node.id !== nodeId),
          edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
        });
      },
      updateNodeField: (nodeId, fieldName, fieldValue) => {
        set({
          nodes: get().nodes.map((node) => {
            if (node.id === nodeId) {
              node.data = { ...node.data, [fieldName]: fieldValue };
            }
    
            return node;
          }),
        });
      },
    }),
    {
      name: 'vector-shift-pipeline',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ nodes: state.nodes, edges: state.edges, nodeIDs: state.nodeIDs }),
    }
  )
);
