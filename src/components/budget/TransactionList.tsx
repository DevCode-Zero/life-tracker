'use client'

import { Transaction } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Trash2, Pencil, ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteTransaction } from '@/lib/budget'
import { toast } from 'react-hot-toast'

interface TransactionListProps {
  transactions: Transaction[]
  onSuccess: () => void
}

export function TransactionList({ transactions, onSuccess }: TransactionListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return
    try {
      await deleteTransaction(id)
      toast.success('Transaction deleted')
      onSuccess()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getIcon = (type: string) => {
    switch (type) {
      case 'income': return <ArrowUpCircle className="w-4 h-4 text-green-400" />
      case 'expense': return <ArrowDownCircle className="w-4 h-4 text-red-400" />
      case 'saving': return <Wallet className="w-4 h-4 text-blue-400" />
      case 'investment': return <TrendingUp className="w-4 h-4 text-violet-400" />
      default: return null
    }
  }

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="card-title text-base">Recent Activity</h2>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {sorted.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-10">No transactions recorded yet</p>
        )}
        {sorted.map((t) => (
          <div key={t.id} className="group flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                {getIcon(t.type)}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{t.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t.category}</span>
                  <span className="text-[10px] text-zinc-600">•</span>
                  <span className="text-[10px] text-zinc-500">{new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <p className={cn(
                "text-sm font-mono font-bold font-bold",
                t.type === 'income' ? 'text-green-400' : 
                t.type === 'expense' ? 'text-red-400' :
                t.type === 'saving' ? 'text-blue-400' : 'text-violet-400'
              )}>
                {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
              </p>
              
              <button 
                onClick={() => handleDelete(t.id)}
                className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-400 text-zinc-600 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
