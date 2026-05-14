import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { API_BASE_URL, requestBlob, requestJson } from '../../src/apiClient'

type FeePayment = {
  id: string
  invoice_id: string
  invoice_reference: string
  student: string
  amount: string
  status: string
  phone_number: string
  checkout_request_id: string
  merchant_request_id: string
  mpesa_receipt_number: string
  result_code: string
  result_description: string
  initiated_at: string
  completed_at: string
}

type FeeStatement = {
  id: string
  reference: string
  student_name: string
  student: string
  class: string
  amount: number
  paid_amount: number
  outstanding_amount: number
  status: string
  due_date: string
  payments: FeePayment[]
}

type FeeSummary = {
  invoiced?: string
  paid?: string
  outstanding?: string
}

type FeeResponse = {
  statements: FeeStatement[]
  payments: FeePayment[]
  summary: FeeSummary
}

export default function StudentFeesPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [statements, setStatements] = useState<FeeStatement[]>([])
  const [payments, setPayments] = useState<FeePayment[]>([])
  const [summary, setSummary] = useState<FeeSummary>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [downloadError, setDownloadError] = useState('')

  const loadFees = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await requestJson<FeeResponse>('/api/dashboard/fees/statements/?page=1&page_size=20')
      setStatements(response.statements || [])
      setPayments(response.payments || [])
      setSummary(response.summary || {})
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load fee statements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    const bootstrap = async () => {
      try {
        await loadFees()
      } finally {
        if (!active) {
          return
        }
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [])

  const handleSendPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      const payload: Record<string, string | number> = {
        phone_number: phoneNumber.trim(),
      }

      if (amount.trim()) {
        payload.amount = Number(amount)
      }

      await requestJson('/api/dashboard/fees/payments/', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      setMessage('M-Pesa request created. Confirm the prompt on your phone.')
      setPhoneNumber('')
      setAmount('')
      await loadFees()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create payment request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadReceipt = async (paymentId: string) => {
    setDownloadError('')
    try {
      const blob = await requestBlob(`/api/dashboard/fees/payments/${paymentId}/receipt/`)
      const objectUrl = URL.createObjectURL(blob)
      window.open(objectUrl, '_blank', 'noopener,noreferrer')?.focus()
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000)
    } catch (receiptError) {
      setDownloadError(receiptError instanceof Error ? receiptError.message : 'Unable to open receipt')
      window.open(`${API_BASE_URL}/api/dashboard/fees/payments/${paymentId}/receipt/`, '_blank', 'noopener,noreferrer')
    }
  }

  const openStatements = statements.filter((statement) => statement.outstanding_amount > 0)

  return (
    <Layout role="student">
      <div className="md:col-span-3 card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Fee Statements & Receipts</h2>
            <p className="text-sm text-gray-600">Pay outstanding fees with M-Pesa, review statements, and download receipts.</p>
          </div>
          <Link href="/student/dashboard" className="text-sm font-semibold text-green-700 hover:text-green-800">
            Back to dashboard
          </Link>
        </div>

        <form onSubmit={handleSendPayment} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Phone number e.g. 0712345678"
            required
          />
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount (optional)"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-70"
          >
            {submitting ? 'Sending STK...' : 'Send M-Pesa Request'}
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="rounded-lg border border-gray-100 bg-green-50 p-3">
            <p className="text-xs font-semibold text-green-700">INVOICED</p>
            <p className="text-lg font-bold text-green-900 mt-1">KES {summary.invoiced || '0'}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-blue-50 p-3">
            <p className="text-xs font-semibold text-blue-700">PAID</p>
            <p className="text-lg font-bold text-blue-900 mt-1">KES {summary.paid || '0'}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-yellow-50 p-3">
            <p className="text-xs font-semibold text-yellow-700">OUTSTANDING</p>
            <p className="text-lg font-bold text-yellow-900 mt-1">KES {summary.outstanding || '0'}</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-4">Leaving the amount blank will target your latest outstanding invoice.</p>
        {message && <p className="text-sm text-green-700 mb-2">{message}</p>}
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        {downloadError && <p className="text-sm text-red-600 mb-2">{downloadError}</p>}
      </div>

      <div className="md:col-span-2 card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Open Statements</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Loading fee statements...</p>
        ) : openStatements.length === 0 ? (
          <p className="text-sm text-gray-500">No outstanding statements found.</p>
        ) : (
          <div className="space-y-3">
            {openStatements.map((statement) => (
              <div key={statement.id} className="rounded-lg border border-gray-100 p-4 bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{statement.reference}</p>
                    <p className="text-xs text-gray-500 mt-1">{statement.class} • Due {statement.due_date ? new Date(statement.due_date).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-xs text-gray-500 mt-1">Paid KES {statement.paid_amount.toLocaleString()} • Outstanding KES {statement.outstanding_amount.toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statement.status === 'overdue' ? 'bg-red-100 text-red-700' : statement.status === 'partial' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {statement.status}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {statement.payments.length === 0 ? (
                    <p className="text-xs text-gray-500">No payments recorded yet.</p>
                  ) : statement.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between gap-3 rounded border border-gray-200 bg-white px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">KES {payment.amount}</p>
                        <p className="text-xs text-gray-500">{payment.phone_number} • {payment.checkout_request_id}</p>
                        <p className="text-xs text-gray-400 mt-1">{payment.mpesa_receipt_number || 'Awaiting confirmation'}</p>
                      </div>
                      <button type="button" onClick={() => handleDownloadReceipt(payment.id)} className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded hover:bg-green-100">
                        Receipt
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="md:col-span-1 card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Loading payments...</p>
        ) : payments.length === 0 ? (
          <p className="text-sm text-gray-500">No payments yet.</p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-lg border border-gray-100 p-3 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{payment.invoice_reference}</p>
                    <p className="text-xs text-gray-500 mt-1">KES {payment.amount} • {payment.phone_number}</p>
                    <p className="text-xs text-gray-400 mt-1">{payment.mpesa_receipt_number || 'Pending receipt'}</p>
                  </div>
                  <button type="button" onClick={() => handleDownloadReceipt(payment.id)} className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded hover:bg-green-100">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

