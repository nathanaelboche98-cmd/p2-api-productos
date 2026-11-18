const express = require("express");
const cors = require("cors");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");

const app = express();
const PORT = process.env.PORT || 3000;
const ARCHIVO = "productos.json";

app.use(cors());
app.use(express.json());

let productos = [
  { id: 1, nombre: "Teclado", precio: 350, stock: 10 },
  { id: 2, nombre: "Mouse", precio: 180, stock: 25 }
];

if (fs.existsSync(ARCHIVO)) {
  productos = JSON.parse(fs.readFileSync(ARCHIVO, "utf-8"));
} else {
  fs.writeFileSync(ARCHIVO, JSON.stringify(productos, null, 2));
}

let siguienteId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;

function guardarDatos() {
  fs.writeFileSync(ARCHIVO, JSON.stringify(productos, null, 2));
}
const swaggerDoc = {
  openapi: "3.0.0",
  info: { title: "API de Productos - P2", version: "1.0.0" },
  paths: {
    "/api/productos": {
      get: {
        summary: "Listar productos o buscar por nombre",
        parameters: [{ name: "buscar", in: "query", schema: { type: "string" } }],
        responses: { 200: { description: "Lista de productos" } }
      },
      post: {
        summary: "Crear un producto",
        requestBody: {
          content: {
            "application/json": {
              example: { nombre: "Monitor", precio: 2500, stock: 5 }
            }
          }
        },
        responses: { 201: { description: "Producto creado" }, 400: { description: "Datos inválidos" } }
      }
    },
    "/api/productos/{id}": {
      get: {
        summary: "Obtener producto por ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Producto encontrado" }, 404: { description: "No existe" } }
      },
      put: {
        summary: "Actualizar producto por ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          content: {
            "application/json": {
              example: { nombre: "Teclado RGB", precio: 420, stock: 8 }
            }
          }
        },
        responses: { 200: { description: "Actualizado" }, 400: { description: "Inválido" }, 404: { description: "No existe" } }
      },
      delete: {
        summary: "Eliminar producto por ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 204: { description: "Eliminado" }, 404: { description: "No existe" } }
      }
    }
  }
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.get("/", (req, res) => {
  res.json({ mensaje: "API de productos funcionando" });
});

app.get("/api/productos", (req, res) => {
  const { buscar } = req.query;
  if (buscar) {
    const filtrados = productos.filter(p =>
      p.nombre.toLowerCase().includes(buscar.toLowerCase())
    );
    return res.status(200).json(filtrados);
  }
  res.status(200).json(productos);
});

app.get("/api/productos/:id", (req, res) => {
  const id = Number(req.params.id);
  const producto = productos.find(p => p.id === id);
  if (!producto) {
    return res.status(404).json({ error: `No existe el producto ${id}` });
  }
  res.status(200).json(producto);
});

function validar(datos) {
  const errores = [];
  if (!datos.nombre || typeof datos.nombre !== "string") errores.push("nombre es obligatorio");
  if (typeof datos.precio !== "number" || datos.precio < 0) errores.push("precio debe ser un número positivo");
  if (!Number.isInteger(datos.stock) || datos.stock < 0) errores.push("stock debe ser un entero positivo");
  return errores;
}

app.post("/api/productos", (req, res) => {
  const errores = validar(req.body);
  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }
  const nuevo = { id: siguienteId++, ...req.body };
  productos.push(nuevo);
  guardarDatos();
  res.status(201).json(nuevo);
});

app.put("/api/productos/:id", (req, res) => {
  const id = Number(req.params.id);
  const indice = productos.findIndex(p => p.id === id);
  if (indice === -1) return res.status(404).json({ error: `No existe el producto ${id}` });

  const errores = validar(req.body);
  if (errores.length > 0) return res.status(400).json({ errores });

  productos[indice] = { id, ...req.body };
  guardarDatos();
  res.status(200).json(productos[indice]);
});

app.delete("/api/productos/:id", (req, res) => {
  const id = Number(req.params.id);
  const existe = productos.some(p => p.id === id);
  if (!existe) return res.status(404).json({ error: `No existe el producto ${id}` });

  productos = productos.filter(p => p.id !== id);
  guardarDatos();
  res.status(204).send();
});

app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));