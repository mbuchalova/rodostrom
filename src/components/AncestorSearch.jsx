import React, { useState } from 'react';
import './index.css';
import './result_card.css';
import './info_modal.css';


// Helper function to generate random test data
const generateRandomPeople = (count) => {
  const names = ['John', 'Jane', 'Michael', 'Emily', 'Chris', 'Sarah'];
  const surnames = ['Doe', 'Smith', 'Johnson', 'Williams', 'Brown'];
  const genders = ['male', 'female'];
  const cities = ['Bratislava', 'Košice', 'Prešov', 'Žilina'];

  return Array.from({ length: count }, (_, id) => ({
    id,
    name: names[Math.floor(Math.random() * names.length)],
    surname: surnames[Math.floor(Math.random() * surnames.length)],
    gender: genders[Math.floor(Math.random() * genders.length)],
    birth_date: `19${Math.floor(Math.random() * 100)}-01-01`,
    death_date: `20${Math.floor(Math.random() * 30)}-01-01`,
    birth_city: cities[Math.floor(Math.random() * cities.length)],
    death_city: cities[Math.floor(Math.random() * cities.length)],
    details: 'Randomly generated person',
  }));
};

const AncestorSearch = ({onSelect}) => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    gender: 'unknown',
    birth_date: '',
    death_date: '',
    birth_city: '',
    death_city: '',
  });

  const [searchResults, setSearchResults] = useState([]);
  const [modalData, setModalData] = useState(null);
  const randomPeople = generateRandomPeople(20);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Search logic: filter random people based on form data
    const results = randomPeople.filter((person) => {
      return (
        (!formData.name || person.name.toLowerCase().includes(formData.name.toLowerCase())) &&
        (!formData.surname || person.surname.toLowerCase().includes(formData.surname.toLowerCase())) &&
        (formData.gender === 'unknown' || person.gender === formData.gender) &&
        (!formData.birth_date || person.birth_date === formData.birth_date) &&
        (!formData.death_date || person.death_date === formData.death_date) &&
        (!formData.birth_city || person.birth_city.toLowerCase().includes(formData.birth_city.toLowerCase())) &&
        (!formData.death_city || person.death_city.toLowerCase().includes(formData.death_city.toLowerCase()))
      );
    });

    setSearchResults(results);
  };

  const openModal = (result) => {
    setModalData(result);
  };

  const closeModal = () => {
    setModalData(null);
  };

  return (
    <section className="container d-flex">
      <div id="search-form-area" className="form-area">
        <form
          className="d-flex flex-column align-items-center justify-content-center"
          onSubmit={handleSubmit}
        >
          <fieldset className="mb-3">
            <legend>Zadanie známych údajov</legend>
            <p>Vyplnte čo najviac údajov</p>
            <p>Môžete zadať aj nepresné informácie</p>
            <p>
              <label htmlFor="name">Meno:</label>
              <input
                type="text"
                name="name"
                id="name"
                size="20"
                value={formData.name}
                onChange={handleChange}
              />
            </p>
            <p>
              <label htmlFor="surname">Priezvisko:</label>
              <input
                type="text"
                name="surname"
                id="surname"
                size="20"
                value={formData.surname}
                onChange={handleChange}
              />
            </p>
            <p>
              <label htmlFor="gender">Pohlavie:</label>
              <select
                name="gender"
                id="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="unknown">Neznáme</option>
                <option value="male">Muž</option>
                <option value="female">Žena</option>
                <option value="other">Iné</option>
              </select>
            </p>
            <p>
              <label htmlFor="birth_date">Dátum narodenia:</label>
              <input
                type="date"
                name="birth_date"
                id="birth_date"
                size="20"
                value={formData.birth_date}
                onChange={handleChange}
              />
            </p>
            <p>
              <label htmlFor="death_date">Dátum úmrtia:</label>
              <input
                type="date"
                name="death_date"
                id="death_date"
                size="20"
                value={formData.death_date}
                onChange={handleChange}
              />
            </p>
            <p>
              <label htmlFor="birth_city">Miesto narodenia:</label>
              <input
                type="text"
                name="birth_city"
                id="birth_city"
                size="20"
                value={formData.birth_city}
                onChange={handleChange}
              />
            </p>
            <p>
              <label htmlFor="death_city">Miesto úmrtia:</label>
              <input
                type="text"
                name="death_city"
                id="death_city"
                size="20"
                value={formData.death_city}
                onChange={handleChange}
              />
            </p>
          </fieldset>
          <p>
            <input type="submit" name="search" id="search" value="VYHĽADAŤ" />
          </p>
        </form>
      </div>

      <div id="search-results-area" className="results-area">
        {searchResults.length > 0 ? (
          <>
            <h2>Výsledky vyhľadávania</h2>
            <div className="results-container">
              {searchResults.map((result) => (
                <div key={result.id} className="result-card">
                  <div className="result-left">
                    <div className="icon-circle"></div>
                  </div>
                  <div className="result-center">
                    <h3>{result.name}</h3>
                    <p>{result.details}</p>
                  </div>
                  <div className="result-right">
                    <button
                      className="add-button"
                      onClick={() => onSelect(result)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="no-results">
            <p>Zatiaľ žiadne výsledky</p>
          </div>
        )}
      </div>

      {modalData && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-button" onClick={closeModal}>
              &times;
            </span>
            <div className="profile-picture"></div>
            <div className="profile-info">
              <h3>{modalData.name}</h3>
              <p>{modalData.details}</p>
            </div>
            <div className="modal-body">
              {/* Дополнительная информация */}
            </div>
            <div className="modal-footer">
              <button className="add-ancestor-button">
                Добавить предка
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AncestorSearch;
