import express from "express";
import Category from "../models/category.js";
import { withDb } from "../db.js";

const router = express.Router();

const findAllArtists = async (req, res) => {
  try {
    const artists = await Category.find().select("name slug imageUrl bio");
    return res
      .status(200)
      .send({ message: "Todos los artistas", categories: artists });
  } catch (error) {
    return res.status(500).send({ message: "Hubo un error", error });
  }
};

const findOneArtistBySlug = async (req, res) => {
  const { slug } = req.params; // Buscamos por slug
  try {
    const artist = await Category.findOne({ slug: slug }).populate("songs.setup"); //los IDs que están en 'songs.setup', buscalos en el modelo 'Product' (tu 'gears') y traelos
    if (!artist) {
      return res.status(404).send({ message: "No se encontró el artista" });
    }
    return res
      .status(200)
      .send({ message: "Artista encontrado", category: artist });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Hubo un error", error: error.message });
  }
};

// Endpoints principales
router.get("/", withDb, findAllArtists);
router.get("/:slug", withDb, findOneArtistBySlug); // Ruta clave para la página de Artista

export default router;
