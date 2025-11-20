import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {

const [searchTerms, setSearchTerms] = useState('');

function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
  const value = event.currentTarget.value;
  setSearchTerms(value);
};

useEffect(() => {
  const timer = setTimeout(() => {
    if (searchTerms.length > 2) {
      console.log('valid length', searchTerms);
    }
  }, 600);

  return () => clearTimeout(timer);
}, [searchTerms])

  return (
    <main>
      <div>
        <h1 className='header'>Natural Language SQL Autocomplete</h1>
      </div>
      <div className='content'>
        <input 
          type='text'
          placeholder='natural language sql search' 
          aria-label='search for your desired SQL query'
          name='querySearch'
          onChange={handleChange}
          value={searchTerms}
        />
      </div>
    </main>
  )
}

export default App
