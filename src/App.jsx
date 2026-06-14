import { useMemo, useState } from "react";
import {
  CalendarDays,
  Compass,
  MapPin,
  Mountain,
  Route,
  SlidersHorizontal,
  X,
} from "lucide-react";
import RoadbookMap from "./components/RoadbookMap";
import DetailPanel from "./components/DetailPanel";
import RangeFilter from "./components/RangeFilter";
import { destinations, trip } from "./tripData";

const formatShortDate = (date) =>
  new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));

export default function App() {
  const maxAltitude = Math.ceil(
    Math.max(...destinations.map((place) => place.altitudeM ?? 0)) / 100,
  ) * 100;
  const minAltitude = Math.floor(
    Math.min(...destinations.map((place) => place.altitudeM ?? 0)) / 100,
  ) * 100;

  const [selectedId, setSelectedId] = useState(null);
  const [dateRange, setDateRange] = useState([1, trip.days.length]);
  const [altitudeRange, setAltitudeRange] = useState([
    minAltitude,
    maxAltitude,
  ]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("filters");
  const [mapMode, setMapMode] = useState("road");
  const [routeStyle, setRouteStyle] = useState({
    visible: true,
    shape: "dashed",
    color: "#b45235",
  });
  const [overviewOpen, setOverviewOpen] = useState(true);

  const visibleDestinations = useMemo(
    () =>
      destinations.filter(
        (place) =>
          place.day >= dateRange[0] &&
          place.day <= dateRange[1] &&
          place.altitudeM >= altitudeRange[0] &&
          place.altitudeM <= altitudeRange[1],
      ),
    [dateRange, altitudeRange],
  );

  const selected = destinations.find((place) => place.id === selectedId);
  const visibleSelected = visibleDestinations.some(
    (place) => place.id === selectedId,
  );

  const handleSelect = (place) => {
    setSelectedId(place.id);
    setOverviewOpen(false);
  };

  const resetFilters = () => {
    setDateRange([1, trip.days.length]);
    setAltitudeRange([minAltitude, maxAltitude]);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <button
          className="brand"
          type="button"
          onClick={() => setOverviewOpen(true)}
          aria-label="查看行程概览"
        >
          <span className="brand-mark">
            <Compass size={17} strokeWidth={1.8} />
          </span>
          <span>
            <small>ROADBOOK / 2026</small>
            <strong>{trip.title}</strong>
          </span>
        </button>

        <div className="topbar-actions">
          <button
            className="text-button desktop-only"
            type="button"
            onClick={() => setOverviewOpen(true)}
          >
            行程概览
          </button>
          <button
            className={`icon-button ${filtersOpen ? "is-active" : ""}`}
            type="button"
            onClick={() => setFiltersOpen((value) => !value)}
            aria-label="打开筛选"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </header>

      <section
        className={`map-stage ${mapMode === "satellite" ? "is-satellite" : ""}`}
      >
        <RoadbookMap
          destinations={visibleDestinations}
          selectedId={visibleSelected ? selectedId : null}
          onSelect={handleSelect}
          onMapModeChange={setMapMode}
          routeStyle={routeStyle}
        />

        {routeStyle.visible && (
          <div className="map-caption">
            <Route size={14} />
            <span>路线为目的地间示意连线</span>
          </div>
        )}

        <aside className={`filter-card ${filtersOpen ? "is-open" : ""}`}>
          <div className="filter-heading">
            <div>
              <span className="eyebrow">FILTER THE JOURNEY</span>
              <h2>筛选旅程</h2>
            </div>
            <button
              className="close-button mobile-only"
              onClick={() => setFiltersOpen(false)}
              aria-label="关闭筛选"
            >
              <X size={20} />
            </button>
          </div>

          <div className="settings-tabs" role="tablist" aria-label="地图设置">
            <button
              type="button"
              role="tab"
              aria-selected={settingsTab === "filters"}
              className={settingsTab === "filters" ? "is-active" : ""}
              onClick={() => setSettingsTab("filters")}
            >
              筛选
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={settingsTab === "route"}
              className={settingsTab === "route" ? "is-active" : ""}
              onClick={() => setSettingsTab("route")}
            >
              路线
            </button>
          </div>

          {settingsTab === "filters" ? (
            <>
              <RangeFilter
                icon={<CalendarDays size={17} />}
                label="日期区间"
                min={1}
                max={trip.days.length}
                step={1}
                value={dateRange}
                onChange={setDateRange}
                formatValue={(day) =>
                  `${formatShortDate(trip.days[day - 1].date)} · Day ${day}`
                }
              />

              <RangeFilter
                icon={<Mountain size={17} />}
                label="海拔"
                min={minAltitude}
                max={maxAltitude}
                step={100}
                value={altitudeRange}
                onChange={setAltitudeRange}
                formatValue={(value) => `${value.toLocaleString()} m`}
              />

              <div className="filter-footer">
                <span>{visibleDestinations.length} 个目的地</span>
                <button type="button" onClick={resetFilters}>
                  重置筛选
                </button>
              </div>
            </>
          ) : (
            <RouteSettings value={routeStyle} onChange={setRouteStyle} />
          )}
        </aside>

        {selected && visibleSelected && !overviewOpen && (
          <DetailPanel
            place={selected}
            onClose={() => setSelectedId(null)}
          />
        )}

        {overviewOpen && (
          <OverviewPanel
            onClose={() => setOverviewOpen(false)}
            onSelect={handleSelect}
          />
        )}
      </section>
    </main>
  );
}

const routeColors = ["#b45235", "#e0a24a", "#315f73", "#455c49", "#efe9da"];

function RouteSettings({ value, onChange }) {
  const update = (patch) => onChange((current) => ({ ...current, ...patch }));

  return (
    <div className="route-settings" role="tabpanel">
      <div className="route-setting-row route-visibility">
        <div>
          <strong>显示路线</strong>
          <span>隐藏后仅保留目的地标记</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={value.visible}
          aria-label="显示路线"
          className={`toggle-switch ${value.visible ? "is-on" : ""}`}
          onClick={() => update({ visible: !value.visible })}
        >
          <i />
        </button>
      </div>

      <div className={`route-setting-block ${!value.visible ? "is-disabled" : ""}`}>
        <span className="setting-label">线条形状</span>
        <div className="shape-options">
          {[
            ["solid", "实线"],
            ["dashed", "虚线"],
            ["dotted", "点线"],
          ].map(([shape, label]) => (
            <button
              type="button"
              key={shape}
              className={value.shape === shape ? "is-active" : ""}
              onClick={() => update({ shape })}
              disabled={!value.visible}
            >
              <i className={`line-sample ${shape}`} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={`route-setting-block ${!value.visible ? "is-disabled" : ""}`}>
        <span className="setting-label">路线颜色</span>
        <div className="color-options">
          {routeColors.map((color) => (
            <button
              type="button"
              key={color}
              aria-label={`路线颜色 ${color}`}
              className={value.color === color ? "is-active" : ""}
              style={{ "--swatch-color": color }}
              onClick={() => update({ color })}
              disabled={!value.visible}
            />
          ))}
          <label className="custom-color">
            <input
              type="color"
              value={value.color}
              onChange={(event) => update({ color: event.target.value })}
              disabled={!value.visible}
              aria-label="自定义路线颜色"
            />
            <span>自定义</span>
          </label>
        </div>
      </div>

      <div className="route-preview">
        <span>ROUTE PREVIEW</span>
        <i
          className={`preview-line ${value.shape}`}
          style={{ "--route-color": value.color }}
        />
      </div>
    </div>
  );
}

function OverviewPanel({ onClose, onSelect }) {
  return (
    <aside className="info-panel overview-panel is-open">
      <div className="panel-scroll">
        <div className="overview-hero">
          <div className="contour-lines" />
          <button
            className="panel-close"
            type="button"
            onClick={onClose}
            aria-label="关闭概览"
          >
            <X size={19} />
          </button>
          <span className="eyebrow light">EXPEDITION NOTES / 2026</span>
          <h1>{trip.title}</h1>
          <p>{trip.subtitle}</p>
        </div>

        <div className="overview-content">
          <div className="trip-stats">
            <div>
              <strong>{trip.days.length}</strong>
              <span>天</span>
            </div>
            <div>
              <strong>{destinations.length}</strong>
              <span>目的地</span>
            </div>
            <div>
              <strong>4,380</strong>
              <span>最高海拔 / m</span>
            </div>
          </div>

          <p className="overview-summary">{trip.summary}</p>

          <div className="section-label">
            <span>ITINERARY</span>
            <i />
          </div>

          <div className="itinerary-list">
            {trip.days.map((day) => (
              <button
                type="button"
                key={day.day}
                className="itinerary-row"
                onClick={() => onSelect(day.destinations[0])}
              >
                <span className="day-number">
                  {String(day.day).padStart(2, "0")}
                </span>
                <span className="day-details">
                  <strong>
                    {day.destinations.map((place) => place.name).join(" · ")}
                  </strong>
                  <small>{formatShortDate(day.date)}</small>
                </span>
                <MapPin size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
