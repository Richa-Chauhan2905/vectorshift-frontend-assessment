import { Handle, Position } from 'reactflow';

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

const NodeHandles = ({ handles = [], side }) => {
  const sideHandles = handles.filter((handle) => (handle.position || 'left') === side);

  return sideHandles.map((handle, index) => (
    <Handle
      key={handle.id}
      type={handle.type}
      position={getPosition(handle.position)}
      id={handle.id}
      style={getHandleStyle(handle, index, sideHandles.length)}
    />
  ));
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
}) => (
  <div className={`base-node ${className}`} data-node-id={id}>
    <NodeHandles handles={handles} side="left" />
    <NodeHandles handles={handles} side="right" />
    <NodeHandles handles={handles} side="top" />
    <NodeHandles handles={handles} side="bottom" />

    <div className="base-node__header">
      <span className="base-node__title">{title}</span>
    </div>

    {description && <p className="base-node__description">{description}</p>}

    {children && <div className="base-node__content">{children}</div>}
  </div>
);
