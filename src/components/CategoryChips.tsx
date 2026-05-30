'use client'

import { motion } from 'framer-motion'

interface CategoryChipsProps {
  categories: string[]
  selected: string
  onSelect: (category: string) => void
}

export function CategoryChips({ categories, selected, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none px-1 -mx-1 mask-linear-r select-none">
      {categories.map((category) => {
        const isSelected = selected === category
        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className="relative px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-colors duration-200 focus:outline-none"
          >
            {isSelected && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 bg-primary rounded-full shadow-md"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className={`relative z-10 transition-colors duration-200 ${
              isSelected ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}>
              {category}
            </span>
          </button>
        )
      })}
    </div>
  )
}
