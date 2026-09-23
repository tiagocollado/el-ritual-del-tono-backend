import express from "express";
const router = express.Router();
import Order from "../models/order.js";
import { withDb } from "../db.js";


const addOrder = async (req, res) => {
  // const { name, categories } = req.body;
    try {
      const order = new Order(req.body);
      await order.save();
      return res.status(200).send({ message: "Order Creada", order });
    } catch (error) {
      return res.status(501).send({ message: "Hubo un error", error });
    }
}


router.post("/", withDb, addOrder);

export default router;