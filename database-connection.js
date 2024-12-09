const mysql = require('mysql2');

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'programación',
    charset: 'utf8mb4'
});

// Conectar a la base de datos
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos MySQL');
});

// Función para obtener todas las notas
const obtenerNotas = () => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM boletinnotas ORDER BY fecha_registro DESC', (error, results) => {
            if (error) reject(error);
            resolve(results);
        });
    });
};

// Función para guardar nuevas notas
const guardarNota = (datos) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO boletinnotas 
            (nombre, apellido, asignatura, primer_trimestre, segundo_trimestre, tercer_trimestre, comentario) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        connection.query(
            query,
            [
                datos.nombre,
                datos.apellido,
                datos.asignatura,
                datos.primer_trimestre,
                datos.segundo_trimestre,
                datos.tercer_trimestre,
                datos.comentario
            ],
            (error, results) => {
                if (error) reject(error);
                resolve(results);
            }
        );
    });
};

module.exports = {
    connection,
    obtenerNotas,
    guardarNota
};
