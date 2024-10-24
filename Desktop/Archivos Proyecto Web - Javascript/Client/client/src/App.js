import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [editItem, setEditItem] = useState({ id: '', name: '' });

  // Función para manejar el login
  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Attempting login with:", username, password);
    try {
      const response = await axios.post('/api/login', { username, password });
      const { token } = response.data;
      setToken(token);
      localStorage.setItem('token', token);
      setMessage('Login successful!');
      fetchItems(token); // Cargar los items después de login
    } catch (error) {
      console.error("Error during login:", error.response?.data || error.message);
      setMessage('Login failed!');
    }
  };

  // Función para obtener items
  const fetchItems = async (token) => {
    try {
      const response = await axios.get('/api/items', {
        headers: { Authorization: token },
      });
      setItems(response.data);
    } catch (error) {
      setMessage('Failed to fetch items');
    }
  };

  // Función para agregar un nuevo item
  const addItem = async () => {
    try {
      const response = await axios.post(
        '/api/items',
        { name: newItem },
        { headers: { Authorization: token } }
      );
      setItems([...items, response.data]);
      setNewItem('');
    } catch (error) {
      setMessage('Failed to add item');
    }
  };

  // Función para actualizar un item
  const updateItem = async (id) => {
    try {
      const response = await axios.put(
        `/api/items/${id}`,
        { name: editItem.name },
        { headers: { Authorization: token } }
      );
      const updatedItems = items.map(item => item.id === id ? response.data : item);
      setItems(updatedItems);
      setEditItem({ id: '', name: '' });
    } catch (error) {
      setMessage('Failed to update item');
    }
  };

  // Función para eliminar un item
  const deleteItem = async (id) => {
    try {
      await axios.delete(`/api/items/${id}`, {
        headers: { Authorization: token },
      });
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      setMessage('Failed to delete item');
    }
  };

  return (
    <div className="App">
      <h1>Hello World!! Login</h1>

      {/* Formulario de login */}
      {!token && (
        <form onSubmit={handleLogin}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">Login</button>
        </form>
      )}

      <p>{message}</p>

      {/* CRUD Operations */}
      {token && (
        <div>
          <h2>Items</h2>
          <ul>
            {items.map(item => (
              <li key={item.id}>
                {editItem.id === item.id ? (
                  <input
                    value={editItem.name}
                    onChange={(e) =>
                      setEditItem({ ...editItem, name: e.target.value })
                    }
                  />
                ) : (
                  item.name
                )}
                <button onClick={() => deleteItem(item.id)}>Delete</button>
                {editItem.id === item.id ? (
                  <button onClick={() => updateItem(item.id)}>Save</button>
                ) : (
                  <button onClick={() => setEditItem(item)}>Edit</button>
                )}
              </li>
            ))}
          </ul>

          <div>
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="New Item"
            />
            <button onClick={addItem}>Add Item</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;