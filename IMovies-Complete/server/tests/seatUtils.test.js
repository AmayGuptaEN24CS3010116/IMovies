import test from "node:test";
import assert from "node:assert/strict";
import { isValidSeatCode, buildSeats, pagination, paginationMeta } from "../lib/seatUtils.js";

test("seat-code validation accepts expected cinema labels", () => {
  assert.equal(isValidSeatCode("A1"), true);
  assert.equal(isValidSeatCode("F8"), true);
  assert.equal(isValidSeatCode("L20"), true);
  assert.equal(isValidSeatCode("A0"), false);
  assert.equal(isValidSeatCode("Z1"), false);
  assert.equal(isValidSeatCode("A1; DROP"), false);
});

test("buildSeats creates a stable row-major layout", () => {
  const seats = buildSeats(2, 3);
  assert.deepEqual(seats, ["A1", "A2", "A3", "B1", "B2", "B3"]);
});

test("seat layout clamps unreasonable dimensions", () => {
  assert.equal(buildSeats(99, 99).length, 240);
  assert.equal(buildSeats(0, 0).length, 48);
});

test("pagination validates page and caps limits", () => {
  assert.deepEqual(pagination({ page: "-1", limit: "1000" }), { page: 1, limit: 100, skip: 0 });
  assert.deepEqual(pagination({ page: "3", limit: "10" }), { page: 3, limit: 10, skip: 20 });
  assert.deepEqual(pagination({}), { page: 1, limit: 24, skip: 0 });
});

test("pagination metadata handles empty and populated results", () => {
  assert.deepEqual(paginationMeta(0, 1, 24), { total: 0, page: 1, limit: 24, pages: 1 });
  assert.deepEqual(paginationMeta(101, 2, 50), { total: 101, page: 2, limit: 50, pages: 3 });
});
