const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');

// Configuración de la conexión a la base de datos
const conexion = mysql.createConnection({
    host: 'localhost',
    database: 'programación',
    user: 'root',
    password: ''
});

// Conexión a la base de datos
conexion.connect((error) => {
    if (error) {
        console.error('Error conectando a la base de datos:', error.message);
        return;
    }
    console.log('Conexión exitosa a la base de datos.');
});

// Configuración del servidor
const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

// Middleware de autenticación
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login.html');
    }
};

// Middleware de roles
const checkRole = (roles) => {
    return (req, res, next) => {
        if (req.session.user && roles.includes(req.session.user.role)) {
            next();
        } else {
            res.status(403).json({ error: 'No tienes permiso para acceder a esta función' });
        }
    };
};

// Ruta principal
app.get('/', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Registro de usuario
app.post('/register', async (req, res) => {
    const { nombre, apellido, email, password, role, username } = req.body;

    // Verificar si el usuario ya existe
    conexion.query('SELECT * FROM usuarios WHERE email = ?', [email], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Insertar nuevo usuario
        const userData = {
            nombre,
            apellido,
            email,
            password,
            role,
            username
        };

        conexion.query('INSERT INTO usuarios SET ?', userData, (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Error al registrar usuario' });
            }

            const userId = results.insertId;
            let roleTable = '';
            
            switch(role) {
                case 'estudiante':
                    roleTable = 'alumnos';
                    break;
                case 'profesor':
                    roleTable = 'profesores';
                    break;
                case 'admin':
                    roleTable = 'administradores';
                    break;
            }

            if (roleTable) {
                conexion.query(`INSERT INTO ${roleTable} (usuario_id) VALUES (?)`, [userId], (error) => {
                    if (error) {
                        console.error('Error al crear entrada en tabla de rol:', error);
                    }
                });
            }

            res.status(201).json({ message: 'Usuario registrado exitosamente' });
        });
    });
});

// Login
app.post('/login', (req, res) => {
    const { email, password, role, username } = req.body;

    conexion.query('SELECT * FROM usuarios WHERE email = ? AND password = ? AND role = ? AND username = ?',
        [email, password, role, username], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = results[0];
        req.session.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            username: user.username
        };

        res.redirect('/index.html');
    });
});

// Rutas protegidas
app.post('/notas', checkRole(['profesor', 'admin']), (req, res) => {
    const { alumno_id, materia, nota, comentario } = req.body;

    conexion.query('INSERT INTO notas (alumno_id, materia, nota, comentario) VALUES (?, ?, ?, ?)',
        [alumno_id, materia, nota, comentario], (error) => {
            if (error) {
                return res.status(500).json({ error: 'Error al guardar la nota' });
            }
            res.json({ message: 'Nota guardada exitosamente' });
        });
});

app.get('/mis-notas', checkRole(['estudiante', 'admin']), (req, res) => {
    conexion.query('SELECT * FROM notas WHERE alumno_id = ?',
        [req.session.user.id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Error al obtener las notas' });
            }
            res.json(results);
        });
});

// Cerrar sesión
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Sesión cerrada' });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log('===============================================');
    console.log('    Servidor iniciado exitosamente');
    console.log(`    Archivos servidos desde: ${__dirname}`);
    console.log('    Accede a: http://localhost:' + PORT);
    console.log('    Serás redirigido al login si no has iniciado sesión');
    console.log('===============================================');
});
