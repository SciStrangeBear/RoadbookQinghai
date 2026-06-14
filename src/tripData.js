import yaml from "js-yaml";
import tripMarkdown from "../trip-template.md?raw";

const frontMatterMatch = tripMarkdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

if (!frontMatterMatch) {
  throw new Error("trip-template.md 缺少有效的 YAML Front Matter");
}

const data = yaml.load(frontMatterMatch[1]);
const content = tripMarkdown.slice(frontMatterMatch[0].length);

const toDateString = (value) => {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};

const days = (data.days ?? []).map((day) => ({
  ...day,
  date: toDateString(day.date),
  destinations: (day.destinations ?? []).map((destination, index) => ({
    ...destination,
    id: `day-${day.day}-stop-${index + 1}`,
    stop: index + 1,
    day: day.day,
    date: toDateString(day.date),
    distanceKm: day.distanceKm,
    drivingTime: day.drivingTime,
    tags: destination.tags ?? [],
    links: destination.links ?? [],
    images: destination.images ?? [],
    notes: destination.notes ?? [],
  })),
}));

export const trip = {
  ...data,
  startDate: toDateString(data.startDate),
  endDate: toDateString(data.endDate),
  days,
  content,
};

export const destinations = days.flatMap((day) => day.destinations);
