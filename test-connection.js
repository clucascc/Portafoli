

// La conexión ya se prueba automáticamente en db.js, 
// pero podemos hacer una consulta simple para verificar
connection.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
        console.error('Error al hacer la consulta de prueba:', err);
        return;
    }
    console.log('Consulta de prueba exitosa:', results);
    
    // Opcional: probar una consulta a tu tabla usuarios
    connection.query('SELECT * FROM usuarios LIMIT 1', (err, users) => {
        if (err) {
            console.error('Error al consultar usuarios:', err);
        } else {
            console.log('Datos de prueba de usuarios:', users);
        }
        
        // Cerrar la conexión después de las pruebas
        connection.end();
    });
});
