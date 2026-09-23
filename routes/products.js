import express from "express";
const router = express.Router();
import Product from "../models/products.js";
import { withDb } from "../db.js";

const findAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res
      .status(200)
      .send({ message: "Todos los products", products: products });
  } catch (error) {
    return res.status(501).send({ message: "Hubo un error", error });
  }
};

const findOneProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findOne({ _id: id });
    if (!product) {
        return res.status(404).send({ message: "Producto no encontrado" });
    }
    return res.status(200).send({ message: "Producto encontrado", product });
  } catch (error) {
    return res.status(501).send({ message: "Hubo un error", error });
  }
};

// Endpoints: SOLO LECTURA.
//
// Este router tenia ademas POST /, PUT /:id y DELETE /:id, sin ninguna
// autenticacion adelante: cualquiera con la URL de la API podia crear,
// modificar o borrar productos del catalogo, que es el que muestra la demo
// publicada y linkeada desde el portfolio.
//
// El frontend nunca los usaba —solo hace GET de productos y POST /orders—,
// asi que la forma mas simple de cerrarlo es no exponerlos. Si alguna vez hace
// falta un panel de administracion, vuelven CON un middleware de autenticacion
// adelante, nunca sueltas. El codigo viejo esta en el historial.
router.get("/", withDb, findAllProducts);
router.get("/:id", withDb, findOneProduct);

export default router;
