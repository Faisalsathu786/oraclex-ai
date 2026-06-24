'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useWallet } from '@/components/web3/Web3Provider'
import { CHAIN } from '@/lib/config'
import { getFactoryContract, isOwner, OWNER_WALLET } from '@/lib/contracts'
import { parseUnits } from 'ethers'
import {
  ArrowLeft,
  Plus,
  X,
  Image as ImageIcon,
  Loader2,
  Check,
  AlertTriangle,
  ExternalLink,
  Wallet,
} from 'lucide-react'

const CATEGORIES = ['Crypto', 'Sports', 'DeFi', 'Politics', 'Entertainment', 'Technology', 'Science']

export default function CreateMarketPage() {
  const router = useRouter()
  const { signer, address, isConnected, connect } = useWallet()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Crypto')
  const [imageUrl, setImageUrl] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [outcomes, setOutcomes] = useState<string[]>(['Yes', 'No'])

  const [submitting, setSubmitting] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Wallet size={40} className="mx-auto mb-4 text-zinc-600" />
          <p className="text-zinc-400 mb-4">Connect your wallet to create a market</p>
          <button onClick={connect} className="px-5 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-colors">
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  if (!isOwner(address)) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={40} className="mx-auto mb-4 text-red-400" />
          <p className="text-zinc-400 mb-4">Only the platform owner can create markets</p>
          <Link href="/" className="text-sm text-purple-400 hover:text-purple-300">← Back to home</Link>
        </div>
      </div>
    )
  }

  const addOutcome = () => {
    if (outcomes.length < 15) setOutcomes([...outcomes, ''])
  }

  const removeOutcome = (index: number) => {
    if (outcomes.length > 2) setOutcomes(outcomes.filter((_, i) => i !== index))
  }

  const updateOutcome = (index: number, value: string) => {
    const updated = [...outcomes]
    updated[index] = value
    setOutcomes(updated)
  }

  const handleSubmit = async () => {
    if (!signer) return
    if (!title.trim()) { setError('Title is required'); return }
    if (outcomes.filter((o) => o.trim()).length < 2) { setError('At least 2 outcomes required'); return }
    if (!endDate) { setError('End date is required'); return }
    if (!endTime) { setError('End time is required'); return }

    setError('')
    setSubmitting(true)
    setStatus('Creating market...')
    setTxHash('')

    try {
    const endTimestamp = Math.floor(new Date(`${endDate}T${endTime || '23:59'}`).getTime() / 1000)
      const outcomeNames = outcomes.filter((o) => o.trim())

      const factory = getFactoryContract(signer)
      const tx = await factory.createMarket(
        title.trim(),
        description.trim(),
        category,
        imageUrl.trim(),
        outcomeNames,
        endTimestamp
      )
      setStatus('Waiting for confirmation...')
      await tx.wait()
      setTxHash(tx.hash)
      setStatus('Market created successfully!')

      // Reset form
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (e: any) {
      setError(e.message?.slice(0, 120) || 'Transaction failed')
      setStatus('')
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">X</div>
            <span className="text-sm font-bold">OracleX</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Create Market</h1>
          <p className="text-sm text-zinc-500 mt-1">Deploy a new prediction market on 0G</p>
        </div>

        <div className="glass-card p-6 space-y-5">
          <div className="px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <p className="text-xs text-purple-300">
              You are creating a market as the platform owner. Supports 2-15 outcomes.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Title</label>
            <input
              type="text"
              placeholder="e.g., Will Bitcoin reach $200,000 in 2026?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Description</label>
            <textarea
              placeholder="Describe the resolution criteria and context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-field resize-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    category === cat
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input-field text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Image URL (optional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-zinc-400">Outcomes ({outcomes.length}/15)</label>
              {outcomes.length < 15 && (
                <button onClick={addOutcome} className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  <Plus size={13} /> Add
                </button>
              )}
            </div>
            <div className="space-y-2">
              {outcomes.map((outcome, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-600 w-5 text-right">{i + 1}.</span>
                  <input
                    type="text"
                    placeholder={`Outcome ${i + 1}`}
                    value={outcome}
                    onChange={(e) => updateOutcome(i, e.target.value)}
                    className="input-field flex-1 text-sm"
                  />
                  {outcomes.length > 2 && (
                    <button onClick={() => removeOutcome(i)} className="p-1 text-red-400 hover:text-red-300 transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          {status && (
            <div className={`px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 ${
              status.includes('success')
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-zinc-800 text-zinc-300'
            }`}>
              {status.includes('success') ? <Check size={14} /> : <Loader2 size={14} className="animate-spin" />}
              {status}
            </div>
          )}

          {txHash && (
            <a
              href={`${CHAIN.explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
            >
              <ExternalLink size={12} /> View transaction on explorer
            </a>
          )}

          <div className="pt-4 border-t border-zinc-800 flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting || !signer}
              className="btn-primary flex-1 text-sm disabled:opacity-40"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Creating...
                </span>
              ) : (
                'Publish Market'
              )}
            </button>
            <Link href="/" className="btn-secondary text-sm">Cancel</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
