'use client'

import { motion } from 'framer-motion'

interface CategoryChipsProps {
  categories: string[]
  selected: string
  onSelect: (category: string) => void
}

export function CategoryChips({ categories, selected, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`px-6 py-2 rounded-full whitespace-nowrap transition-all ${
            selected === category
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
