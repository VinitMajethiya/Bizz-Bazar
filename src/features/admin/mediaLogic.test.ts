import { describe, it, expect } from 'vitest';
import type { ProductImage } from '../../lib/types';

describe('Media Panel Image Logic', () => {
  const sampleImages: ProductImage[] = [
    {
      id: 'img-1',
      productId: 'prod-1',
      imageUrl: 'https://example.com/1.webp',
      storagePath: 'prod-1/1.webp',
      alt: 'Front view',
      isHero: true,
      displayOrder: 0,
      variantKey: null,
    },
    {
      id: 'img-2',
      productId: 'prod-1',
      imageUrl: 'https://example.com/2.webp',
      storagePath: 'prod-1/2.webp',
      alt: 'Side angle',
      isHero: false,
      displayOrder: 1,
      variantKey: 'Gold',
    },
    {
      id: 'img-3',
      productId: 'prod-1',
      imageUrl: 'https://example.com/3.webp',
      storagePath: 'prod-1/3.webp',
      alt: 'Model wearing piece',
      isHero: false,
      displayOrder: 2,
      variantKey: null,
    },
  ];

  it('promotes the next image to hero when the hero image is deleted', () => {
    const deletedImageId = 'img-1';
    const remaining = sampleImages.filter((img) => img.id !== deletedImageId);

    // Sort remaining by displayOrder ascending
    const sortedRemaining = [...remaining].sort((a, b) => a.displayOrder - b.displayOrder);

    // Promote the first remaining image as hero
    const updated = sortedRemaining.map((img, index) => ({
      ...img,
      isHero: index === 0,
    }));

    expect(updated).toHaveLength(2);
    expect(updated[0].id).toBe('img-2');
    expect(updated[0].isHero).toBe(true);
    expect(updated[1].isHero).toBe(false);
  });

  it('ensures only one image is hero when user selects a new hero', () => {
    const selectedNewHeroId = 'img-3';
    const updated = sampleImages.map((img) => ({
      ...img,
      isHero: img.id === selectedNewHeroId,
    }));

    const heroes = updated.filter((img) => img.isHero);
    expect(heroes).toHaveLength(1);
    expect(heroes[0].id).toBe('img-3');
  });

  it('correctly updates display order after reordering', () => {
    // Move img-3 to index 0: [img-3, img-1, img-2]
    const reorderedIds = ['img-3', 'img-1', 'img-2'];
    const updated = reorderedIds.map((id, index) => {
      const match = sampleImages.find((img) => img.id === id)!;
      return { ...match, displayOrder: index };
    });

    expect(updated[0].id).toBe('img-3');
    expect(updated[0].displayOrder).toBe(0);
    expect(updated[1].id).toBe('img-1');
    expect(updated[1].displayOrder).toBe(1);
    expect(updated[2].id).toBe('img-2');
    expect(updated[2].displayOrder).toBe(2);
  });

  it('calculates aspect-ratio preserving dimensions capped at 1600px long edge', () => {
    function computeResizedDimensions(w: number, h: number, maxLongEdge = 1600) {
      let width = w;
      let height = h;
      if (width > maxLongEdge || height > maxLongEdge) {
        if (width >= height) {
          height = Math.round((height * maxLongEdge) / width);
          width = maxLongEdge;
        } else {
          width = Math.round((width * maxLongEdge) / height);
          height = maxLongEdge;
        }
      }
      return { width, height };
    }

    // Wide landscape (2400 x 1200) -> 1600 x 800
    expect(computeResizedDimensions(2400, 1200)).toEqual({ width: 1600, height: 800 });

    // Tall portrait (1000 x 2000) -> 800 x 1600
    expect(computeResizedDimensions(1000, 2000)).toEqual({ width: 800, height: 1600 });

    // Square oversized (3000 x 3000) -> 1600 x 1600
    expect(computeResizedDimensions(3000, 3000)).toEqual({ width: 1600, height: 1600 });

    // Smaller than 1600px -> unchanged
    expect(computeResizedDimensions(800, 600)).toEqual({ width: 800, height: 600 });
  });
});
