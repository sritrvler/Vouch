'use client';
import React, { useState, useEffect } from 'react';

export function MasonryGrid({ children }: { children: React.ReactNode }) {
  const [cols, setCols] = useState(1);

  useEffect(() => {
    function update() {
      if (window.matchMedia('(min-width: 1024px)').matches) setCols(3);
      else if (window.matchMedia('(min-width: 640px)').matches) setCols(2);
      else setCols(1);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const items = React.Children.toArray(children);
  const columns: React.ReactNode[][] = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => columns[i % cols].push(item));

  return (
    <div className="flex gap-4">
      {columns.map((col, i) => (
        <div key={i} className="flex flex-col gap-4 flex-1">
          {col}
        </div>
      ))}
    </div>
  );
}
