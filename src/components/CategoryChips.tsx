'use client'

import { motion } from 'framer-motion'

interface CategoryChipsProps {
  categories: string[]
  selected: string
  onSelect: (category: string) => void
}

export function CategoryChips({ categories, selected, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide px-4">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
            selected === category
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-card text-card-foreground border border-border hover:bg-border/20'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
