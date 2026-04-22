import { useState } from 'react'

function App() {
  const [addTableName, setAddTableName] = useState('')
  const [addColumnName, setAddColumnName] = useState('')
  const [addResult, setAddResult] = useState('')

  const [getTableName, setGetTableName] = useState('')
  const [getResult, setGetResult] = useState('')

  const handleAddTable = async () => {
    const res = await fetch(`/tables/addTable?tableName=${encodeURIComponent(addTableName)}&columnName=${encodeURIComponent(addColumnName)}`, {
      method: 'POST',
    })
    const text = await res.text()
    setAddResult(text)
  }

  const handleGetTable = async () => {
    const res = await fetch(`/tables/getData?tableName=${encodeURIComponent(getTableName)}`)
    const text = await res.text()
    setGetResult(text)
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Add Table</h2>
        <input placeholder="Table name" value={addTableName} onChange={e => setAddTableName(e.target.value)} />
        <input placeholder="Column name" value={addColumnName} onChange={e => setAddColumnName(e.target.value)} style={{ marginLeft: '0.5rem' }} />
        <button onClick={handleAddTable} style={{ marginLeft: '0.5rem' }}>Add Table</button>
        {addResult && <p>{addResult}</p>}
      </div>

      <div>
        <h2>Get Table</h2>
        <input placeholder="Table name" value={getTableName} onChange={e => setGetTableName(e.target.value)} />
        <button onClick={handleGetTable} style={{ marginLeft: '0.5rem' }}>Get Table</button>
        {getResult && <p>{getResult}</p>}
      </div>
    </div>
  )
}

export default App

