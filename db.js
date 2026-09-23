import mongoose from "mongoose";
import chalk from "chalk";
import "dotenv/config";

// Promesa de conexion, cacheada para que todos los pedidos que llegan mientras
// se esta conectando esperen al mismo intento en lugar de abrir uno cada uno.
let connectionPromise = null;

const buildConnectionString = () => {
  let connectionString = process.env.DB_PROTOCOL;
  if (process.env.DB_USER && process.env.DB_PASS) {
    connectionString += `${process.env.DB_USER}:${process.env.DB_PASS}@`;
  }
  connectionString += `${process.env.DB_HOST}/${process.env.DB_NAME}`;
  return `${connectionString}?retryWrites=true&w=majority`;
};

// DB Connection
//
// Antes esto intentaba conectar una sola vez y, si fallaba, solo lo logueaba.
// En serverless eso es una trampa: el contenedor que arranca en frio sin poder
// llegar a Atlas queda roto para toda su vida y contesta errores en cada
// pedido, aunque la base vuelva a estar disponible un segundo despues. La demo
// se cae en silencio y la unica forma de levantarla es redeployar a mano.
//
// El arreglo esta en el catch: al fallar se suelta la promesa, asi el proximo
// pedido vuelve a intentar conectar en lugar de quedar atado al intento que ya
// fallo. Un contenedor se recupera solo.
const connectDb = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(buildConnectionString(), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((connection) => {
        console.log(chalk.green("Conected to database"));
        return connection;
      })
      .catch((err) => {
        connectionPromise = null;
        console.log(chalk.bgRed.white("Database not connected", err.message));
        throw err;
      });
  }

  return connectionPromise;
};

// Middleware para las rutas que consultan la base. Se cuelga solo de esas:
// `GET /` queda afuera a proposito, para que siga contestando 200 aunque Mongo
// este caido. Esa diferencia es la que deja distinguir "la app no levanta" de
// "la app levanta pero no llega a la base", que es justo el sintoma que hubo
// que diagnosticar a mano la ultima vez.
const withDb = async (req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (err) {
    return res.status(503).send({ message: "Base de datos no disponible" });
  }
};

const disconnectDb = async () => {
  try {
    await mongoose.connection.close();
    connectionPromise = null;
    console.log(chalk.green("Disconnected from Database"));
  } catch (err) {
    console.log(err);
  }
};

export { connectDb, disconnectDb, withDb };
