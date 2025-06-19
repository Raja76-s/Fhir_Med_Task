import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/fhir';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';

function Home() {
  const [patients, setPatients] = useState([]);
  const [offset, setOffset] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();
  const count = 10;

  // 🔁 Pagination fetch
  useEffect(() => {
    if (searchVal.trim() !== '') return;

    fetch(`${api}/Patient?_count=${count}&_getpagesoffset=${offset}&_sort=-_lastUpdated`)
      .then(res => res.json())
      .then(data => {
        if (data.entry) {
          const formatted = data.entry.map(item => {
            const p = item.resource;
            return {
              id: p.id || 'unk',
              name: (p.name?.[0]?.given?.[0] || 'unknown') + ' ' + (p.name?.[0]?.family || ''),
              gender: p.gender || 'Unknown',
              dob: p.birthDate || 'N/A',
            };
          });
          setPatients(formatted);
          setIsLastPage(formatted.length < count);
        } else {
          setPatients([]);
          setIsLastPage(true);
        }
      });
  }, [offset, searchVal]);

  // 🔍 Debounced search by name or phone
  const debouncedSearch = useCallback(debounce((val) => {
    if (!val.trim()) {
      setOffset(0);
      return;
    }

    const encoded = encodeURIComponent(val.trim());
    const urlByName = `${api}/Patient?name=${encoded}&_sort=-_lastUpdated`;
    const urlByPhone = `${api}/Patient?telecom=${encoded}&_sort=-_lastUpdated`;

    Promise.all([
      fetch(urlByName).then(res => res.json()),
      fetch(urlByPhone).then(res => res.json())
    ]).then(([nameData, phoneData]) => {
      const mergeResources = (entries = []) =>
        entries.map(item => {
          const p = item.resource;
          return {
            id: p.id || 'unk',
            name: (p.name?.[0]?.given?.[0] || 'unknown') + ' ' + (p.name?.[0]?.family || ''),
            gender: p.gender || 'Unknown',
            dob: p.birthDate || 'N/A',
          };
        });

      const nameEntries = nameData.entry || [];
      const phoneEntries = phoneData.entry || [];

      const all = [...nameEntries, ...phoneEntries];
      const unique = Array.from(new Map(all.map(item => [item.resource.id, item])).values());

      const formatted = mergeResources(unique);
      setPatients(formatted);
      setIsLastPage(true);
    }).catch(err => {
      console.error('Search failed:', err);
      setPatients([]);
      setIsLastPage(true);
    });
  }, 1000), []);

  useEffect(() => {
    debouncedSearch(searchVal);
  }, [searchVal, debouncedSearch]);

  const handleNext = () => {
    if (!isLastPage) setOffset(offset + count);
  };

  const handlePrev = () => {
    if (offset >= count) {
      setOffset(offset - count);
      setIsLastPage(false);
    }
  };

  // 💄 Basic styles
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    background: '#f9f9f9',
    minHeight: '100vh',
  };

  const headerStyle = {
    marginBottom: '1rem',
    fontWeight: 'bold',
    fontSize: '1.5rem',
    color: '#333',
  };

  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    marginBottom: '10px',
    cursor: 'pointer',
  };

  const inputStyle = {
    width: '250px',
    padding: '8px',
    margin: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  };

  const rowHeaderStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr 1fr',
    width: '100%',
    maxWidth: '1100px',
    padding: '10px',
    fontWeight: 'bold',
    background: '#ddd',
    borderRadius: '5px',
  };

  const rowStyle = (hovered) => ({
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr 1fr',
    width: '100%',
    maxWidth: '1100px',
    padding: '10px',
    marginTop: '5px',
    backgroundColor: hovered ? '#ffe6e6' : '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    boxShadow: hovered ? '0 0 5px #888' : 'none',
    transition: '0.2s',
  });

  const paginationStyle = {
    marginTop: '20px',
    display: 'flex',
    gap: '10px',
  };

  const smallButton = {
    ...buttonStyle,
    padding: '6px 12px',
    backgroundColor: '#28a745',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>Patient Data</div>

      <button style={buttonStyle} onClick={() => navigate('/create')}>Create Patient</button>

      <input
        type="text"
        value={searchVal}
        onChange={(e) => setSearchVal(e.target.value)}
        placeholder="Search by name or phone number"
        style={inputStyle}
      />

      <div style={rowHeaderStyle}>
        <span>ID</span>
        <span>Name</span>
        <span>Gender</span>
        <span>DOB</span>
      </div>

      {patients.map((p, i) => (
        <div
          key={i}
          onMouseEnter={() => setHoveredRow(i)}
          onMouseLeave={() => setHoveredRow(null)}
          onClick={() => navigate(`/update/${p.id}`)}
          style={rowStyle(i === hoveredRow)}
        >
          <span>{p.id}</span>
          <span>{p.name}</span>
          <span>{p.gender}</span>
          <span>{p.dob}</span>
        </div>
      ))}

      {searchVal.trim() === '' && (
        <div style={paginationStyle}>
          <button onClick={handlePrev} disabled={offset === 0} style={smallButton}>Previous</button>
          <button onClick={handleNext} disabled={isLastPage} style={smallButton}>Next</button>
        </div>
      )}
    </div>
  );
}

export default Home;
