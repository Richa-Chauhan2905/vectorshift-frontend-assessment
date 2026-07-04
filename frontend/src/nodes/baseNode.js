import { Fragment, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2 } from 'lucide-react';
import { useStore } from '../store';

const getPosition = (position) => {
  if (position === 'right') {
    return Position.Right;
  }

  if (position === 'top') {
    return Position.Top;
  }

  if (position === 'bottom') {
    return Position.Bottom;
  }

  return Position.Left;
};

const getHandleStyle = (handle, index, count) => {
  const isVerticalSide = handle.position === 'left' || handle.position === 'right' || !handle.position;

  if (!isVerticalSide || handle.style) {
    return handle.style;
  }

  return {
    top: `${((index + 1) * 100) / (count + 1)}%`,
  };
};

const getHandleLabelStyle = (handleStyle, side) => {
  if (!handleStyle) {
    return undefined;
  }

  const baseStyle = {
    position: 'absolute',
    top: handleStyle.top,
    transform: 'translateY(-50%)',
    whiteSpace: 'nowrap',
    fontSize: '10px',
    color: '#111827',
    background: '#ffffff',
    padding: '2px 6px',
    borderRadius: '999px',
    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.08)',
    zIndex: 5,
  };

  if (side === 'left') {
    return {
      ...baseStyle,
      right: '100%',
      marginRight: '8px',
      textAlign: 'right',
    };
  }

  return {
    ...baseStyle,
    left: '100%',
    marginLeft: '8px',
    textAlign: 'left',
  };
};

const NodeHandles = ({ handles = [], side }) => {
  const sideHandles = handles.filter((handle) => (handle.position || 'left') === side);

  return sideHandles.map((handle, index) => {
    const handleStyle = getHandleStyle(handle, index, sideHandles.length);

    return (
      <Fragment key={handle.id}>
        {handle.label && (
          <span style={getHandleLabelStyle(handleStyle, side)}>
            {handle.label}
          </span>
        )}
        <Handle
          type={handle.type}
          position={getPosition(handle.position)}
          id={handle.id}
          style={{ ...handleStyle, zIndex: 20, pointerEvents: 'all' }}
          isConnectable={handle.isConnectable !== false}
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        />
      </Fragment>
    );
  });
};

export const NodeField = ({ label, children }) => (
  <label className="node-field">
    <span>{label}</span>
    {children}
  </label>
);

export const NodeTextInput = ({ value, onChange, placeholder }) => (
  <input
    className="node-control"
    type="text"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
  />
);

export const NodeTextarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    className="node-control node-control--textarea"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    rows={rows}
  />
);

export const NodeRange = ({ value, onChange, min = 0, max = 1, step = 0.1 }) => (
  <div className="node-range">
    <input
      className="node-range__input"
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
    <span className="node-range__value">{value}</span>
  </div>
);

export const NodeSelect = ({ value, onChange, options }) => (
  <select
    className="node-control"
    value={value}
    onChange={(event) => onChange(event.target.value)}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export const BaseNode = ({
  id,
  title,
  description,
  handles = [],
  children,
  className = '',
}) => {
  const deleteNode = useStore((state) => state.deleteNode);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className={`base-node ${className}`}
      data-node-id={id}
      onClick={() => setShowDelete(true)}
    >
      <NodeHandles handles={handles} side="left" />
      <NodeHandles handles={handles} side="right" />
      <NodeHandles handles={handles} side="top" />
      <NodeHandles handles={handles} side="bottom" />

      <div className="base-node__header">
        <span className="base-node__title">{title}</span>
        {showDelete && (
          <button
            type="button"
            className="base-node__delete"
            onClick={(event) => {
              event.stopPropagation();
              deleteNode(id);
            }}
            aria-label={`Delete ${title} node`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {description && <p className="base-node__description">{description}</p>}

      {children && <div className="base-node__content">{children}</div>}
    </div>
  );
};
