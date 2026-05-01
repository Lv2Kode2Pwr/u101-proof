import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from './supabase'

function VerifyItem() {
  const { hash } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [ownership, setOwnership] = useState([])
  const [loading, setLoading] = useState(true)
  const [transferForm, setTransferForm] = useState({
    owner_name: '',
    owner_email: ''
  })
  const [transferred, setTransferred] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      const { data: itemData } = await supabase
        .from('items')
        .select('*')
        .eq('hash', hash)
        .single()

      if (itemData) {
        setItem(itemData)

        const { data: ownerData } = await supabase
          .from('ownership_log')
          .select('*')
          .eq('item_id', itemData.id)
          .order('acquired_at', { ascending: true })

        setOwnership(ownerData || [])
      }

      setLoading(false)
    }

    fetchItem()
  }, [hash])

  const handleTransfer = async () => {
    await supabase.from('ownership_log').insert([
      {
        item_id: item.id,
        owner_name: transferForm.owner_name,
        owner_email: transferForm.owner_email,
        note: 'transferred'
      }
    ])

    await supabase
      .from('items')
      .update({ status: 'transferred' })
      .eq('id', item.id)

    setTransferred(true)
  }

  const canTransfer = transferForm.owner_name.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(transferForm.owner_email)

  const pageStyles = {
    minHeight: '100vh',
    padding: '40px 20px',
    background: 'linear-gradient(180deg, #f4f7fb 0%, #e9eff9 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
  }

  const cardStyles = {
    width: '100%',
    maxWidth: '600px',
    background: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)',
    padding: '36px',
    border: '1px solid rgba(15, 23, 42, 0.08)'
  }

  const headerStyles = {
    marginBottom: '22px',
    fontSize: '2rem',
    color: '#102a43'
  }

  const sectionHeaderStyles = {
    marginTop: '28px',
    marginBottom: '14px',
    fontSize: '1.2rem',
    color: '#243b53'
  }

  const labelStyles = {
    marginBottom: '10px',
    color: '#334e68',
    fontSize: '0.95rem',
    fontWeight: '600'
  }

  const inputStyles = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1px solid #cbd5e1',
    marginBottom: '16px',
    fontSize: '1rem',
    color: '#102a43'
  }

  const hintStyles = {
    marginTop: '-12px',
    marginBottom: '18px',
    color: '#617d98',
    fontSize: '0.9rem',
    lineHeight: '1.5'
  }

  const buttonStyles = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    border: 'none',
    background: canTransfer ? '#2563eb' : '#94a3b8',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: canTransfer ? 'pointer' : 'not-allowed',
    transition: 'background 0.2s ease'
  }

  const imageStyles = {
    width: '100%',
    maxWidth: '100%',
    borderRadius: '16px',
    marginTop: '18px',
    objectFit: 'cover',
    border: '1px solid #e2e8f0'
  }

  if (loading) return (
    <div style={pageStyles}>
      <div style={cardStyles}>Loading...</div>
    </div>
  )

  if (!item) return (
    <div style={pageStyles}>
      <div style={cardStyles}>Item not found.</div>
    </div>
  )

  return (
    <div style={pageStyles}>
      <div style={cardStyles}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={headerStyles}>{item.item_name}</h1>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#102a43',
              cursor: 'pointer',
              fontWeight: '700'
            }}
          >
            Back to Register
          </button>
        </div>

        <div style={{ display: 'grid', gap: '14px' }}>
          <div><strong>Materials:</strong> {item.materials}</div>
          <div><strong>Origin:</strong> {item.origin}</div>
          <div><strong>Status:</strong> {item.status}</div>
          <div><strong>Registered:</strong> {new Date(item.created_at).toLocaleDateString()}</div>
        </div>

        {item.photo_url && <img src={item.photo_url} alt={item.item_name} style={imageStyles} />}

        <h2 style={sectionHeaderStyles}>Ownership History</h2>
        {ownership.length === 0 ? (
          <p style={{ color: '#334e68' }}>No ownership records yet.</p>
        ) : (
          ownership.map((record) => (
            <div key={record.id} style={{ marginBottom: '16px', padding: '16px', background: '#f8fbff', borderRadius: '14px' }}>
              <p style={{ margin: 0, fontWeight: '700', color: '#102a43' }}>{record.owner_name}</p>
              <p style={{ margin: '6px 0 0', color: '#486581' }}>{new Date(record.acquired_at).toLocaleDateString()}</p>
              {record.note && <p style={{ margin: '8px 0 0', color: '#334e68' }}>{record.note}</p>}
            </div>
          ))
        )}

        <h2 style={sectionHeaderStyles}>Transfer Ownership</h2>
        {!transferred ? (
          <div>
            <input
              placeholder="New owner name"
              onChange={(e) => setTransferForm({ ...transferForm, owner_name: e.target.value })}
              style={inputStyles}
              value={transferForm.owner_name}
            />
            <input
              placeholder="New owner email"
              onChange={(e) => setTransferForm({ ...transferForm, owner_email: e.target.value })}
              style={inputStyles}
              value={transferForm.owner_email}
            />
            <div style={hintStyles}>Enter the new owner name and email to transfer ownership.</div>
            <button onClick={handleTransfer} style={buttonStyles} disabled={!canTransfer}>
              Transfer
            </button>
          </div>
        ) : (
          <p style={{ color: '#16a34a', fontWeight: '700' }}>Ownership transferred successfully.</p>
        )}
      </div>
    </div>
  )
}

export default VerifyItem