import { useParams } from 'react-router-dom';
import { useState } from 'react';

function Update() {
  const { id } = useParams();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');

  const handleSubmit = () => {
    const body = {
      resourceType: "Patient",
      id: id,
      name: [
        {
          given: [firstName],
          family: lastName
        }
      ],
      gender: gender,
      birthDate: dob
    };

    console.log("FHIR Patient Body to Submit:", body);

    // Example PUT request to update patient
    fetch(`https://hapi.fhir.org/baseR4/Patient/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/fhir+json'
      },
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
      alert('Patient updated successfully!');
      console.log(data);
    })
    .catch(err => {
      console.error("Error updating patient:", err);
    });
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '2rem auto',
      padding: '2rem',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f9f9f9'
    }}>
      <h2 style={{ marginBottom: '1.5rem', color: '#333', textAlign: 'center' }}>
        Update Patient <span style={{ color: '#007bff' }}>{id}</span>
      </h2>

      {/* First Name */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="firstName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          First Name
        </label>
        <input
          id="firstName"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Enter first name"
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Last Name */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="lastName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Last Name
        </label>
        <input
          id="lastName"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Enter last name"
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Gender */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="gender" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Gender
        </label>
        <select
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '1rem'
          }}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* DOB */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="dob" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Date of Birth
        </label>
        <input
          id="dob"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '1rem'
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: '#007bff',
          color: 'white',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Save Changes
      </button>
    </div>
  );
}

export default Update;
