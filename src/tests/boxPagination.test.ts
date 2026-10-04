import { describe, it, expect } from 'vitest';

describe('Box 40-Pokemon-Per-Page Pagination Logic', () => {
  const BOX_PAGE_SIZE = 40;

  it('correctly calculates total pages and boundaries for various counts', () => {
    // 0 pokemon
    let total = 0;
    let totalPages = Math.max(1, Math.ceil(total / BOX_PAGE_SIZE));
    expect(totalPages).toBe(1);

    // 25 pokemon (within 1 page)
    total = 25;
    totalPages = Math.max(1, Math.ceil(total / BOX_PAGE_SIZE));
    expect(totalPages).toBe(1);

    // 40 pokemon (exact page 1 boundary)
    total = 40;
    totalPages = Math.max(1, Math.ceil(total / BOX_PAGE_SIZE));
    expect(totalPages).toBe(1);

    // 41 pokemon (spills to page 2)
    total = 41;
    totalPages = Math.max(1, Math.ceil(total / BOX_PAGE_SIZE));
    expect(totalPages).toBe(2);

    // 80 pokemon (exact 2 pages)
    total = 80;
    totalPages = Math.max(1, Math.ceil(total / BOX_PAGE_SIZE));
    expect(totalPages).toBe(2);

    // 95 pokemon (3 pages: 40 + 40 + 15)
    total = 95;
    totalPages = Math.max(1, Math.ceil(total / BOX_PAGE_SIZE));
    expect(totalPages).toBe(3);
  });

  it('properly slices items according to page index', () => {
    const mockList = Array.from({ length: 95 }, (_, i) => ({ id: i + 1, name: `Pkmn_${i + 1}` }));

    const getPageSlice = (page: number, items: typeof mockList) => {
      const totalPages = Math.max(1, Math.ceil(items.length / BOX_PAGE_SIZE));
      const safePage = Math.min(Math.max(1, page), totalPages);
      const start = (safePage - 1) * BOX_PAGE_SIZE;
      const end = Math.min(start + BOX_PAGE_SIZE, items.length);
      return {
        safePage,
        totalPages,
        start,
        end,
        slice: items.slice(start, end)
      };
    };

    // Page 1
    const p1 = getPageSlice(1, mockList);
    expect(p1.safePage).toBe(1);
    expect(p1.slice.length).toBe(40);
    expect(p1.slice[0].id).toBe(1);
    expect(p1.slice[39].id).toBe(40);

    // Page 2
    const p2 = getPageSlice(2, mockList);
    expect(p2.safePage).toBe(2);
    expect(p2.slice.length).toBe(40);
    expect(p2.slice[0].id).toBe(41);
    expect(p2.slice[39].id).toBe(80);

    // Page 3
    const p3 = getPageSlice(3, mockList);
    expect(p3.safePage).toBe(3);
    expect(p3.slice.length).toBe(15);
    expect(p3.slice[0].id).toBe(81);
    expect(p3.slice[14].id).toBe(95);

    // Clamping invalid / out-of-range page requests
    const pOverflow = getPageSlice(99, mockList);
    expect(pOverflow.safePage).toBe(3);
    expect(pOverflow.slice.length).toBe(15);

    const pUnderflow = getPageSlice(0, mockList);
    expect(pUnderflow.safePage).toBe(1);
    expect(pUnderflow.slice.length).toBe(40);
  });

  it('resets and adjusts safely when filters reduce the result set', () => {
    const mockList = Array.from({ length: 120 }, (_, i) => ({
      id: i + 1,
      type: i % 2 === 0 ? 'fire' : 'water'
    }));

    // Without filters: 120 items -> 3 pages of 40
    let totalPages = Math.ceil(mockList.length / BOX_PAGE_SIZE);
    expect(totalPages).toBe(3);

    // Filter to fire: 60 items -> 2 pages
    const fireOnly = mockList.filter(p => p.type === 'fire');
    expect(fireOnly.length).toBe(60);
    totalPages = Math.ceil(fireOnly.length / BOX_PAGE_SIZE);
    expect(totalPages).toBe(2);

    // If user was on page 3, safe clamping brings them to page 2
    const prevPage = 3;
    const clampedPage = Math.min(Math.max(1, prevPage), totalPages);
    expect(clampedPage).toBe(2);
  });
});
