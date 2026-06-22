'use client'

import { useState } from 'react'
import { Calendar, Globe, Image, Plus, X } from 'lucide-react'
import Link from 'next/link'

const categories = ['Crypto', 'Sports', 'Politics', 'AI', 'Finance', 'Entertainment', 'Custom']

export default function CreateMarketPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Crypto')
  const [imageUrl, setImageUrl] = useState('')
  const [resolutionSource, setResolutionSource] = useState('')
  const [endDate, setEndDate] = useState('')
  const [outcomes, setOutcomes] = useState<string[]>(['', ''])

  const addOutcome = () => {
    if (outcomes.length < 15) {
      setOutcomes([...outcomes, ''])
    }
  }

  const removeOutcome = (index: number) => {
    if (outcomes.length > 2) {
      setOutcomes(outcomes.filter((_, i) => i !== index))
    }
  }

  const updateOutcome = (index: number, value: string) => {
    const updated = [...outcomes]
    updated[index] = value
    setOutcomes(updated)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Market</h1>
        <p className="text-muted-foreground mt-1">Admin panel - create new prediction market with multiple outcomes</p>
      </div>

      <div className="glass-card p-8 space-y-6">
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-sm text-primary font-medium">
            Only platform moderators and administrators can create markets. Each market supports 2 to 15 outcomes.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Market Title</label>
          <input
            type="text"
            placeholder="e.g., Who will win the Cricket World Cup 2026?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            placeholder="Describe the market conditions, resolution criteria..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="input-field resize-none"
          />
        </div>

        {/* Outcomes Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Outcomes ({outcomes.length}/15)</label>
            {outcomes.length < 15 && (
              <button onClick={addOutcome} className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
                <Plus size={16} /> Add Outcome
              </button>
            )}
          </div>
          <div className="space-y-2">
            {outcomes.map((outcome, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-6 text-right">{index + 1}.</span>
                <input
                  type="text"
                  placeholder={`Outcome ${index + 1} (e.g., Pakistan, India, Australia...)`}
                  value={outcome}
                  onChange={e => updateOutcome(index, e.target.value)}
                  className="input-field flex-1"
                />
                {outcomes.length > 2 && (
                  <button onClick={() => removeOutcome(index)} className="text-destructive hover:text-destructive/80 p-1">
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
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
            <label className="block text-sm font-medium mb-2">End Date & Time</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field pl-10" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Market Image URL</label>
          <div className="relative">
            <Image className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input type="url" placeholder="https://example.com/market-image.jpg" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="input-field pl-10" />
          </div>
          {imageUrl && (
            <div className="mt-2 rounded-xl overflow-hidden h-32 bg-surface border border-border">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Resolution Source</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input type="url" placeholder="https://..." value={resolutionSource} onChange={e => setResolutionSource(e.target.value)} className="input-field pl-10" />
          </div>
        </div>

        <div className="rounded-xl bg-surface border border-border p-4">
          <h4 className="text-sm font-semibold mb-2">Fee Structure</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>- Buy shares: No fees</p>
            <p>- Sell shares: Protocol fee (sell tax) applies</p>
            <p>- On resolution: Loser pools distribute to winners</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex items-center gap-3">
          <button className="btn-primary flex-1">Publish Market</button>
          <Link href="/markets" className="btn-secondary">Cancel</Link>
        </div>
      </div>
    </div>
  )
}
