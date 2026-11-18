# P2 - API de Productos

API REST de productos hecha con Node.js y Express para la práctica 2. Permite listar, buscar por ID, crear, actualizar y eliminar productos en formato JSON.

## Cómo instalar

En la carpeta del proyecto abrir la terminal y ejecutar:

npm install
npm start

Para correrlo en modo desarrollo:

npm run dev

El servidor corre en http://localhost:3000

## Rutas de la API

| Método | Ruta | Acción | Respuesta correcta | Posibles errores |
| --- | --- | --- | --- | --- |
| GET | /api/productos | Listar todos | 200 + arreglo | |
| GET | /api/productos/:id | Ver uno | 200 + objeto | 404 |
| POST | /api/productos | Crear | 201 + objeto creado | 400 |
| PUT | /api/productos/:id | Actualizar | 200 + objeto actualizado | 400, 404 |
| DELETE | /api/productos/:id | Eliminar | 204 sin contenido | 404 |

## Ejemplo de petición y respuesta

Petición: POST http://localhost:3000/api/productos

Cuerpo enviado (JSON):
{
  "nombre": "Monitor",
  "precio": 2500,
  "stock": 5
}

Respuesta recibida (201 Created):
{
  "id": 3,
  "nombre": "Monitor",
  "precio": 2500,
  "stock": 5
}