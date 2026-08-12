import assert from "node:assert/strict";
import { test } from "node:test";
import {
  SearchQueryRequestSchema,
  SearchResponseSchema,
  SearchSuggestRequestSchema,
  SearchSuggestResponseSchema,
} from "../src/search/schemas.js";

test("SearchQueryRequestSchema applies default values", () => {
  const result = SearchQueryRequestSchema.parse({});
  assert.equal(result.q, "");
  assert.equal(result.locale, "vi");
  assert.equal(result.limit, 20);
});

test("SearchQueryRequestSchema validates custom params", () => {
  const result = SearchQueryRequestSchema.parse({
    q: "Áo dài",
    types: ["artifact", "exhibition"],
    locale: "en",
    limit: 10,
  });
  assert.equal(result.q, "Áo dài");
  assert.deepEqual(result.types, ["artifact", "exhibition"]);
  assert.equal(result.locale, "en");
  assert.equal(result.limit, 10);
});

test("SearchResponseSchema validates structured search results", () => {
  const response = SearchResponseSchema.parse({
    items: [
      {
        id: "art-1",
        code: "ART-001",
        type: "artifact",
        title: "Ấn vàng Hoàng đế tôn thân chi bảo",
        summary: "Báu vật quốc gia triều Nguyễn",
        score: 0.95,
        highlights: ["Ấn vàng"],
      },
    ],
    total: 1,
    facets: [
      { type: "artifact", count: 1 },
      { type: "exhibition", count: 0 },
    ],
  });

  assert.equal(response.total, 1);
  assert.equal(response.items[0]?.title, "Ấn vàng Hoàng đế tôn thân chi bảo");
  assert.equal(response.facets[0]?.count, 1);
});

test("SearchSuggestResponseSchema validates autocomplete responses", () => {
  const response = SearchSuggestResponseSchema.parse({
    suggestions: ["Ấn vàng", "Áo dài truyền thống"],
    featured: [],
  });

  assert.equal(response.suggestions.length, 2);
  assert.equal(response.suggestions[0], "Ấn vàng");
});
