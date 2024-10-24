const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'mysecretkey';

// Simulando una base de datos de usuarios
const users = [
  {
    id: 1,
    username: 'user1',
    password: bcrypt.hashSync('password1', 8), // Contraseña hasheada
  },
];

// Simulando una base de datos de items para CRUD
let items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
];

// Ruta para el login (autenticación)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Verifica que los datos están siendo recibidos
  console.log("Username:", username);
  console.log("Password:", password);

  const user = users.find(u => u.username === username);
  if (!user) {
    console.log("User not found");
    return res.status(404).json({ message: 'User not found' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    console.log("Invalid password");
    return res.status(401).json({ message: 'Invalid password' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '1h',
  });

  console.log("Login successful, token generated:", token);
  res.json({ token });
});

// Middleware para verificar el token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.userId = decoded.id;
    next();
  });
};

// CRUD Operations

// Obtener todos los items (protegido)
app.get('/api/items', verifyToken, (req, res) => {
  res.json(items);
});

// Crear un nuevo item (protegido)
app.post('/api/items', verifyToken, (req, res) => {
  const newItem = { id: items.length + 1, name: req.body.name };
  items.push(newItem);
  res.json(newItem);
});

// Actualizar un item (protegido)
app.put('/api/items/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const item = items.find(i => i.id == id);
  if (item) {
    item.name = name;
    res.json(item);
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
});

// Eliminar un item (protegido)
app.delete('/api/items/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  items = items.filter(i => i.id != id);
  res.json({ message: 'Item deleted' });
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});