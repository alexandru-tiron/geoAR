export const toRadians = (degrees: number) => degrees * (Math.PI / 180);
export const toDegrees = (radians: number) => radians * (180 / Math.PI);

export const getBearing = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const dLon = toRadians(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
  const x =
    Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
    Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);
  const bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360;
};

export const getDistance = (
  p1: { latitude: number; longitude: number },
  p2: { latitude: number; longitude: number }
): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = toRadians(p1.latitude);
  const φ2 = toRadians(p2.latitude);
  const Δφ = toRadians(p2.latitude - p1.latitude);
  const Δλ = toRadians(p2.longitude - p1.longitude);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // Distance in meters
  return d;
};
