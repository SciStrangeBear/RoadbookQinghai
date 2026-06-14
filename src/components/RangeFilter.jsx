export default function RangeFilter({
  icon,
  label,
  min,
  max,
  step,
  value,
  onChange,
  formatValue,
}) {
  const [lower, upper] = value;
  const range = max - min || 1;
  const lowerPercent = ((lower - min) / range) * 100;
  const upperPercent = ((upper - min) / range) * 100;

  const updateLower = (event) => {
    const next = Math.min(Number(event.target.value), upper - step);
    onChange([next, upper]);
  };

  const updateUpper = (event) => {
    const next = Math.max(Number(event.target.value), lower + step);
    onChange([lower, next]);
  };

  return (
    <div className="range-filter">
      <div className="range-title">
        <span>
          {icon}
          {label}
        </span>
      </div>
      <div className="range-values">
        <strong>{formatValue(lower)}</strong>
        <span />
        <strong>{formatValue(upper)}</strong>
      </div>
      <div
        className="range-track"
        style={{
          "--range-start": `${lowerPercent}%`,
          "--range-end": `${upperPercent}%`,
        }}
      >
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lower}
          onChange={updateLower}
          aria-label={`${label}最小值`}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={upper}
          onChange={updateUpper}
          aria-label={`${label}最大值`}
        />
      </div>
    </div>
  );
}
