export function isValidSeatCode(seat) {
  return typeof seat === "string" && /^[A-L](?:[1-9]|1\d|20)$/.test(seat);
}

export function buildSeats(rows = 6, seatsPerRow = 8) {
  const safeRows = Math.min(12, Math.max(1, Number(rows) || 6));
  const safeSeatsPerRow = Math.min(20, Math.max(1, Number(seatsPerRow) || 8));
  return Array.from({ length: safeRows * safeSeatsPerRow }, (_, index) =>
    `${String.fromCharCode(65 + Math.floor(index / safeSeatsPerRow))}${(index % safeSeatsPerRow) + 1}`
  );
}

export function pagination(query = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 24));
  return { page, limit, skip: (page - 1) * limit };
}

export function paginationMeta(total, page, limit) {
  return { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
}
