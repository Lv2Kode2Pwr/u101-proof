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

  const handleSubmit = async () => {
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
    await supabase.from('ownership_log').insert([{
    item_id: data[0].id,
    owner_name: form.owner_name,
    owner_email: form.owner_email,
    note: 'original creator'
  }])

  setCreatedHash(hash)
  setSubmitted(true)
}
const [createdHash, setCreatedHash] = useState('')
if (submitted) return (
  <div>
    <h2>Item Registered</h2>
    <p>Scan to verify this piece:</p>
    <QRCodeSVG value={`http://localhost:5173/verify/${createdHash}`} />
    <p>{createdHash}</p>
  </div>
)
  return (
    <div>
      <h1>Register U1O1 Item</h1>
      <input name="item_name" placeholder="Item name" onChange={handleChange} /><br/>
      <input name="materials" placeholder="Materials" onChange={handleChange} /><br/>
      <input name="origin" placeholder="Origin" onChange={handleChange} /><br/>
      <input name="photo_url" placeholder="Photo URL" onChange={handleChange} /><br/>
      <input name="owner_name" placeholder="Your name" onChange={handleChange} /><br/>
      <input name="owner_email" placeholder="Your email" onChange={handleChange} /><br/>
      <button onClick={handleSubmit}>Register Item</button>
    </div>
  )
}

export default App