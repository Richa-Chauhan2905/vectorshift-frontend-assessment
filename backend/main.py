import re
from typing import Any, Dict, List, Optional, Set

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PipelineNode(BaseModel):
    id: str
    type: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


class PipelineEdge(BaseModel):
    id: Optional[str] = None
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class PipelinePayload(BaseModel):
    nodes: List[PipelineNode] = Field(default_factory=list)
    edges: List[PipelineEdge] = Field(default_factory=list)


NODE_HANDLE_SCHEMA = {
    "customInput": {"source": {"value"}, "target": set()},
    "llm": {"source": {"response"}, "target": {"system", "prompt"}},
    "customOutput": {"source": set(), "target": {"value"}},
    "text": {"source": {"output"}, "target": set()},
    "filter": {"source": {"match", "reject"}, "target": {"input"}},
    "merge": {"source": {"merged"}, "target": {"first", "second"}},
    "jsonParser": {"source": {"value", "error"}, "target": {"json"}},
    "http": {"source": {"response", "error"}, "target": {"body"}},
    "debug": {"source": set(), "target": {"value"}},
}


def get_node_type(node: PipelineNode) -> Optional[str]:
    if node.type:
        return node.type

    if node.data:
        node_type = node.data.get("nodeType")
        if isinstance(node_type, str):
            return node_type

    return None


def get_handle_suffix(node_id: str, handle_id: Optional[str]) -> Optional[str]:
    prefix = f"{node_id}-"

    if not handle_id or not handle_id.startswith(prefix):
        return None

    return handle_id[len(prefix) :]


def get_variable_names(text: str) -> List[str]:
    pattern = r"\{\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\}\}"
    return list(set(re.findall(pattern, text or "")))


def get_allowed_handles(node: PipelineNode, direction: str) -> Set[str]:
    node_type = get_node_type(node)
    if not node_type or node_type not in NODE_HANDLE_SCHEMA:
        return set()

    if node_type == "text":
        if direction == "source":
            return {"output"}
        else: # target
            text_val = ""
            if node.data:
                text_val = node.data.get("text", "")
            return set(get_variable_names(text_val))

    return NODE_HANDLE_SCHEMA[node_type][direction]


def validate_handle(
    node: PipelineNode,
    handle_id: Optional[str],
    direction: str,
) -> Optional[str]:
    node_type = get_node_type(node)
    if node_type not in NODE_HANDLE_SCHEMA:
        return None

    handle_suffix = get_handle_suffix(node.id, handle_id)
    allowed_handles = get_allowed_handles(node, direction)

    if handle_suffix not in allowed_handles:
        allowed_labels = ", ".join(sorted(f"{node.id}-{handle}" for handle in allowed_handles))
        if not allowed_labels:
            allowed_labels = "none"
        return (
            f"Node '{node.id}' does not have {direction} handle '{handle_id}'. "
            f"Allowed {direction} handles: {allowed_labels}."
        )

    return None


def is_acyclic(node_ids: Set[str], edges: List[PipelineEdge]) -> bool:
    adjacency = {node_id: [] for node_id in node_ids}
    indegree = {node_id: 0 for node_id in node_ids}

    for edge in edges:
        adjacency[edge.source].append(edge.target)
        indegree[edge.target] += 1

    queue = [node_id for node_id, degree in indegree.items() if degree == 0]
    visited_count = 0

    while queue:
        node_id = queue.pop(0)
        visited_count += 1

        for next_node_id in adjacency[node_id]:
            indegree[next_node_id] -= 1
            if indegree[next_node_id] == 0:
                queue.append(next_node_id)

    return visited_count == len(node_ids)


def get_disconnected_components(node_ids: Set[str], edges: List[PipelineEdge]) -> List[List[str]]:
    adjacency = {node_id: set() for node_id in node_ids}

    for edge in edges:
        adjacency[edge.source].add(edge.target)
        adjacency[edge.target].add(edge.source)

    seen = set()
    components = []

    for node_id in sorted(node_ids):
        if node_id in seen:
            continue

        component = []
        stack = [node_id]
        seen.add(node_id)

        while stack:
            current_node_id = stack.pop()
            component.append(current_node_id)

            for next_node_id in adjacency[current_node_id]:
                if next_node_id not in seen:
                    seen.add(next_node_id)
                    stack.append(next_node_id)

        components.append(sorted(component))

    return components


@app.get("/")
def read_root():
    return {"Ping": "Pong"}


@app.post("/pipelines/parse")
def parse_pipeline(payload: PipelinePayload):
    nodes = payload.nodes
    edges = payload.edges
    node_ids = [node.id for node in nodes]
    unique_node_ids = set(node_ids)
    nodes_by_id = {node.id: node for node in nodes}
    errors = []

    if not nodes:
        errors.append("Pipeline must contain at least one node.")

    for node in nodes:
        if not node.id.strip():
            errors.append("Every node must have a non-empty ID.")

        node_type = get_node_type(node)
        if not node_type:
            errors.append(f"Node '{node.id}' must have a type.")
        elif node_type not in NODE_HANDLE_SCHEMA:
            errors.append(f"Node '{node.id}' has unsupported type '{node_type}'.")

    if len(unique_node_ids) != len(node_ids):
        errors.append("Pipeline contains duplicate node IDs.")

    valid_edges = []
    has_invalid_edge = False
    seen_edge_ids = set()
    seen_connections = set()
    for edge in edges:
        if edge.id:
            if edge.id in seen_edge_ids:
                errors.append(f"Pipeline contains duplicate edge ID '{edge.id}'.")
                has_invalid_edge = True
            seen_edge_ids.add(edge.id)

        if not edge.source.strip() or not edge.target.strip():
            errors.append("Every edge must have a non-empty source and target.")
            has_invalid_edge = True
            continue

        if edge.source not in unique_node_ids:
            errors.append(f"Edge source '{edge.source}' does not exist.")
            has_invalid_edge = True
            continue

        if edge.target not in unique_node_ids:
            errors.append(f"Edge target '{edge.target}' does not exist.")
            has_invalid_edge = True
            continue

        if edge.source == edge.target:
            errors.append(f"Node '{edge.source}' cannot connect to itself.")
            has_invalid_edge = True
            continue

        source_node_type = get_node_type(nodes_by_id[edge.source])
        target_node_type = get_node_type(nodes_by_id[edge.target])
        source_handle_error = validate_handle(edge.source, source_node_type, edge.sourceHandle, "source")
        target_handle_error = validate_handle(edge.target, target_node_type, edge.targetHandle, "target")

        if source_handle_error:
            errors.append(source_handle_error)
            has_invalid_edge = True
            continue

        if target_handle_error:
            errors.append(target_handle_error)
            has_invalid_edge = True
            continue

        connection_key = (edge.source, edge.sourceHandle, edge.target, edge.targetHandle)
        if connection_key in seen_connections:
            errors.append(
                f"Duplicate connection from '{edge.sourceHandle}' to '{edge.targetHandle}'."
            )
            has_invalid_edge = True
            continue
        seen_connections.add(connection_key)

        valid_edges.append(edge)

    has_cycle = bool(unique_node_ids) and not is_acyclic(unique_node_ids, valid_edges)
    if has_cycle:
        errors.append("Pipeline contains a cycle.")

    connected_node_ids = set()
    for edge in valid_edges:
        connected_node_ids.add(edge.source)
        connected_node_ids.add(edge.target)

    isolated_node_ids = sorted(unique_node_ids - connected_node_ids)
    if isolated_node_ids:
        errors.append(
            "Every node must be connected to the pipeline. Isolated nodes: "
            + ", ".join(isolated_node_ids)
            + "."
        )

    components = get_disconnected_components(unique_node_ids, valid_edges) if unique_node_ids else []
    if len(components) > 1:
        component_labels = ["[" + ", ".join(component) + "]" for component in components]
        errors.append(
            "Pipeline must be one connected graph. Disconnected groups: "
            + "; ".join(component_labels)
            + "."
        )

    is_dag = bool(nodes) and len(unique_node_ids) == len(node_ids) and not has_invalid_edge and not has_cycle
    is_valid_pipeline = len(errors) == 0

    return {
        "num_nodes": len(nodes),
        "num_edges": len(edges),
        "is_dag": is_dag,
        "is_valid_pipeline": is_valid_pipeline,
        "errors": errors,
    }
