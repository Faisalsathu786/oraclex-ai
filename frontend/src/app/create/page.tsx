'use client'

import { useState } from 'react'
import { Calendar, Globe, Image } from 'lucide-react'
import Link from 'next/link'

const categories = ['Crypto', 'Sports', 'Politics', 'AI', 'Finance', 'Entertainment', 'Custom']

export default function CreateMarketPage() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Crypto')

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Market</h1>
        <p className="text-muted-foreground mt-1">Create a new prediction market for others to trade</p>
      </div>

      <div className="glass-card p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Market Title</label>
          <input
            type="text"
            placeholder="e.g., Will BTC reach $200K before Dec 2026?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            placeholder="Describe the market conditions, resolution criteria, and any relevant information..."
            rows={4}
            className="input-field resize-none"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    category === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input type="datetime-local" className="input-field pl-10" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Resolution Source (optional)</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input type="url" placeholder="https://..." className="input-field pl-10" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Market Image (optional)</label>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Image className="mx-auto mb-2 text-muted-foreground" size={32} />
            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            A 2.5% protocol fee will be applied to market settlement. Markets require moderator approval before going live.
          </p>
          <div className="flex items-center gap-3">
            <button className="btn-primary flex-1">Submit Market for Review</button>
            <Link href="/markets" className="btn-secondary">Cancel</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
