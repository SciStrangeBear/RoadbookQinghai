import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  ExternalLink,
  Gauge,
  MapPin,
  Mountain,
  Route,
  X,
} from "lucide-react";

const formatDate = (date) =>
  new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));

export default function DetailPanel({ place, onClose }) {
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    setLightbox(null);
  }, [place.id]);

  return (
    <>
      <aside className="info-panel detail-panel is-open">
        <div className="panel-scroll">
          <div className="detail-header">
            <button
              className="panel-close"
              type="button"
              onClick={onClose}
              aria-label="关闭详情"
            >
              <X size={19} />
            </button>
            <div className="day-lockup">
              <span>DAY</span>
              <strong>{String(place.day).padStart(2, "0")}</strong>
              {place.stop > 1 && <sup>STOP {place.stop}</sup>}
            </div>
            <div className="location-kicker">
              <MapPin size={14} />
              <span>DESTINATION / {place.coordinates.lat.toFixed(3)}° N</span>
            </div>
            <h1>{place.name}</h1>
            <p className="detail-date">{formatDate(place.date)}</p>
          </div>

          <div className="detail-body">
            <div className="fact-grid">
              <Fact
                icon={<Mountain size={18} />}
                value={`${place.altitudeM.toLocaleString()} m`}
                label="海拔"
              />
              <Fact
                icon={<Route size={18} />}
                value={
                  place.distanceKm ? `${place.distanceKm} km` : "待补充"
                }
                label="当日里程"
              />
              <Fact
                icon={<Clock3 size={18} />}
                value={place.drivingTime || "待补充"}
                label="驾驶时间"
              />
            </div>

            <div className="editorial-rule">
              <span>FIELD NOTE</span>
              <i />
            </div>
            <p className="lead-copy">{place.summary}</p>

            {place.notes.length > 0 && (
              <section className="notes-section">
                <h2>途中提醒</h2>
                <ol>
                  {place.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ol>
              </section>
            )}

            {place.images.length > 0 && (
              <section className="gallery-section">
                <h2>沿途影像</h2>
                <div className="image-grid">
                  {place.images.map((image) => (
                    <button
                      type="button"
                      key={image.src}
                      onClick={() => setLightbox(image)}
                    >
                      <img src={image.src} alt={image.alt || place.name} />
                      {image.caption && <span>{image.caption}</span>}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {place.links.length > 0 && (
              <section className="links-section">
                <h2>相关链接</h2>
                {place.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>{link.title}</span>
                    <ExternalLink size={15} />
                  </a>
                ))}
              </section>
            )}

            <div className="coordinate-card">
              <span>COORDINATES</span>
              <strong>
                {place.coordinates.lat.toFixed(5)},{" "}
                {place.coordinates.lng.toFixed(5)}
              </strong>
            </div>
          </div>
        </div>
      </aside>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button type="button" aria-label="关闭图片">
            <X size={22} />
          </button>
          <img src={lightbox.src} alt={lightbox.alt || place.name} />
          {lightbox.caption && <p>{lightbox.caption}</p>}
        </div>
      )}
    </>
  );
}

function Fact({ icon, value, label }) {
  return (
    <div className="fact">
      <span>{icon}</span>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </div>
  );
}
