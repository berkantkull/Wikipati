type Position = { latitude: number; longitude: number };
export function vetMapsUrl(position: Position | null, area = "") {
  if (
    position &&
    (!Number.isFinite(position.latitude) ||
      !Number.isFinite(position.longitude) ||
      Math.abs(position.latitude) > 90 ||
      Math.abs(position.longitude) > 180)
  )
    throw Error("Geçerli konum alınamadı.");
  const query = position
    ? `veteriner near ${position.latitude.toFixed(4)},${position.longitude.toFixed(4)}`
    : `veteriner ${area.trim()}`;
  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(query)
  );
}
