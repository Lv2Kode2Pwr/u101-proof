import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from './supabase'

function VerifyItem() {
  const { hash } = useParams()
  const [item, setItem] = useState(null)
  const [ownership, setOwnership] = useState([])
  const [loading, setLoading] = useState(true)

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

  if (loading) return <div>Loading...</div>
  if (!item) return <div>Item not found.</div>

  return (
    <div>
      <h1>{item.item_name}</h1>
      <p><strong>Materials:</strong> {item.materials}</p>
      <p><strong>Origin:</strong> {item.origin}</p>
      <p><strong>Status:</strong> {item.status}</p>
      <p><strong>Registered:</strong> {new Date(item.created_at).toLocaleDateString()}</p>
      {item.photo_url && <img src={item.photo_url} alt={item.item_name} width="300" />}

      <h2>Ownership History</h2>
      {ownership.length === 0 ? (
        <p>No ownership records yet.</p>
      ) : (
        ownership.map((record) => (
          <div key={record.id}>
            <p><strong>{record.owner_name}</strong> — {new Date(record.acquired_at).toLocaleDateString()}</p>
            {record.note && <p>{record.note}</p>}
          </div>
        ))
      )}
    </div>
  )
}

export default VerifyItem