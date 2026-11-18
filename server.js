const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ARCHIVO_DATOS = path.join(__dirname, "productos.json");

app.use(cors());
app.use(express.json()); 
const datosIniciales = [
  { id: 1, nombre: "Teclado", precio: 350, stock: 10 },
  { id: 2, nombre: "Mouse", precio: 180, stock: 25 }
];
function cargarProductos() {
  try {
    if (fs.existsSync(ARCHIVO_DATOS)) {
      const contenido = fs.readFileSync(ARCHIVO_DATOS, "utf-8");
      return JSON.parse(contenido);
    }
  } catch (err) {
    console.error("Error al leer productos.json, usando datos en memoria:", err.message);
  }
  guardarProductos(datosIniciales);
  return [...datosIniciales];
}

function guardarProductos(lista) {
  try {
    fs.writeFileSync(ARCHIVO_DATOS, JSON.stringify(lista, null, 2), "utf-8");
  } catch (err) {
    console.error("Error al guardar en productos.json:", err.message);
  }
}

let productos = cargarProductos();
let siguienteId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
function validar(datos) {
  const errores = [];
  if (!datos.nombre || typeof datos.nombre !== "string" || datos.nombre.trim() === "") {
    errores.push("nombre es obligatorio");
  }
  if (typeof datos.precio !== "number" || datos.precio < 0) {
    errores.push("precio debe ser un número positivo");
  }
  if (!Number.isInteger(datos.stock) || datos.stock < 0) {
    errores.push("stock debe ser un entero positivo");
  }
  return errores;
}
app.get("/", (req, res) => {
  res.json({ mensaje: "API de productos funcionando" });
});
app.get("/api/productos", (req, res) => {
  const { buscar } = req.query;
  if (buscar) {
    const termino = buscar.toLowerCase();
    const filtrados = productos.filter(p =>
      p.nombre.toLowerCase().includes(termino)
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
app.post("/api/productos", (req, res) => {
  const errores = validar(req.body);
  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }
  const nuevo = {
    id: siguienteId++,
    nombre: req.body.nombre.trim(),
    precio: req.body.precio,
    stock: req.body.stock
  };
  productos.push(nuevo);
  guardarProductos(productos);
  res.status(201).json(nuevo);
});
app.put("/api/productos/:id", (req, res) => {
  const id = Number(req.params.id);
  const indice = productos.findIndex(p => p.id === id);
  if (indice === -1) {
    return res.status(404).json({ error: `No existe el producto ${id}` });
  }

  const errores = validar(req.body);
  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  productos[indice] = {
    id,
    nombre: req.body.nombre.trim(),
    precio: req.body.precio,
    stock: req.body.stock
  };
  guardarProductos(productos);
  res.status(200).json(productos[indice]);
});

app.delete("/api/productos/:id", (req, res) => {
  const id = Number(req.params.id);
  const existe = productos.some(p => p.id === id);
  if (!existe) {
    return res.status(404).json({ error: `No existe el producto ${id}` });
  }
  productos = productos.filter(p => p.id !== id);
  guardarProductos(productos);
  res.status(204).send();
});
app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
