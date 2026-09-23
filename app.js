import "dotenv/config";
import express from "express";
import cors from "cors";
import indexRoutes from "./routes/index.js";
import productsRoutes from "./routes/products.js";
import categoriesRoutes from "./routes/categories.js";
import ordersRoutes from "./routes/orders.js";

/* Clear the console  */
console.log("\x1Bc");

const app = express();

// DB Connection
import { connectDb } from "./db.js";
connectDb();

/* Settings */
app.set("port", process.env.PORT || 4000);

/* Middlewares */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "local"
        ? [`http://${process.env.FRONT_URL}`]
        : [
            `https://${process.env.FRONT_URL}`,
            `https://www.${process.env.FRONT_URL}`,
          ],
    credentials: true,
    exposedHeaders: "Authorization",
  })
);

/* Routes */
app.use("/", indexRoutes);
app.use("/products", productsRoutes);
app.use("/categories", categoriesRoutes);
app.use("/orders", ordersRoutes);

/* Error handler  */
// 404: cualquier ruta que no matcheo ninguna de arriba.
//
// Antes esto llamaba a `createError(404)`, una funcion que nunca se importo,
// asi que el 404 explotaba y el handler de abajo devolvia 500 con el texto
// "createError is not defined" — o sea, una URL mal escrita contestaba un
// error de servidor con el nombre de una funcion interna adentro.
app.use(function (req, res) {
  res.status(404).send({ message: "Not found" });
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send({ message: err.message || "error" });
});

/* Starting server */
app.listen(app.get("port"), () => {
  console.log(`Server on port ${app.get("port")}`);
});
