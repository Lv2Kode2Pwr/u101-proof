import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'

function App() {
  const [form, setForm] = useState({
    item_name: '',
    materials: '',
    origin: '',
    photo_url: '',
    owner_name: '',
    owner_email: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.owner_email)
  const isPhotoUrlValid = /^[^\s]+\.[^\s]+$/.test(form.photo_url.trim())
  const canSubmit = isEmailValid && isPhotoUrlValid

  const handleSubmit = async () => {
    if (!canSubmit) return
    const hash = uuidv4()
    const { data, error } = await supabase
      .from('items')
      .insert([{
      item_name: form.item_name,
      materials: form.materials,
      origin: form.origin,
      photo_url: form.photo_url,
      hash,
      status: 'available'
    }])
    .select()

    if (error) {
      console.error(error)
      return
    }
    await supabase.from('ownership_log').insert([
      {
        item_id: data[0].id,
        owner_name: form.owner_name,
        owner_email: form.owner_email,
        note: 'original creator'
      }
    ])

    setCreatedHash(hash)
    setSubmitted(true)
  }

  const [createdHash, setCreatedHash] = useState('')

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
    maxWidth: '520px',
    background: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)',
    padding: '36px',
    border: '1px solid rgba(15, 23, 42, 0.08)'
  }

  const headerStyles = {
    marginBottom: '24px',
    fontSize: '2rem',
    color: '#102a43'
  }

    const inputStyles = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1px solid #cbd5e1',
    marginBottom: '14px',
    fontSize: '1rem',
    color: '#102a43',
    background: '#ffffff'
  }


  const hintStyles = {
    margin: '0 0 18px 0',
    color: '#617d98',
    fontSize: '0.9rem',
    lineHeight: '1.5'
  }

  const buttonStyles = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    border: 'none',
    background: canSubmit ? '#2563eb' : '#94a3b8',
    color: '#ffffff',
    fontSize: '1rem',
    ontWeight: '700',
    cursor: canSubmit ? 'pointer' : 'not-allowed',
    transition: 'background 0.2s ease'
  }

  if (submitted) return (
    <div style={pageStyles}>
      <div style={cardStyles}>
        <h2 style={{ marginBottom: '20px' }}>Item Registered</h2>
        <p>Scan to verify this piece:</p>
        <div style={{ margin: '24px 0' }}>
          <QRCodeSVG value={`https://u101-proof.vercel.app/verify/${createdHash}`} />
        </div>
        <p style={{ wordBreak: 'break-all', color: '#334e68' }}>{createdHash}</p>
      </div>
    </div>
  )

  return (
    <div style={pageStyles}>
      <div style={cardStyles}>
        <h1 style={headerStyles}>Register U1O1 Item</h1>

        <input
          name="item_name"
          placeholder="Item name"
          onChange={handleChange}
          style={inputStyles}
          value={form.item_name}
        />

        <input
          name="materials"
          placeholder="Materials"
          onChange={handleChange}
          style={inputStyles}
          value={form.materials}
        />

        <input
          name="origin"
          placeholder="Origin"
          onChange={handleChange}
          style={inputStyles}
          value={form.origin}
        />

        <input
          name="photo_url"
          type="url"
          placeholder="Photo URL (https://abc.com/image.jpg)"
          onChange={handleChange}
          style={inputStyles}
          value={form.photo_url}
        />
        <div style={hintStyles}>Enter a valid URL for the item photo, like abc.com or https://example.com/image.jpg.</div>

        <input
          name="owner_name"
          placeholder="Your name"
          onChange={handleChange}
          style={inputStyles}
          value={form.owner_name}
        />

        <input
          name="owner_email"
          type="email"
          placeholder="Your email (sd@abc.com)"
          onChange={handleChange}
          style={inputStyles}
          value={form.owner_email}
        />
        <div style={hintStyles}>Enter a valid email address, for example sd@abc.com.</div>

        <button
          onClick={handleSubmit}
          style={buttonStyles}
          disabled={!canSubmit}
        >
          Register Item
        </button>
      </div>
    </div>
  )
}

export default App