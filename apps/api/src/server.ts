
import express from "express";
import productRoutes from "./modules/products/products.routes.js"
import authRoutes from "./modules/auth/auth.routes.js"
import { erroHandlerMiddleware } from "./middlewares/errorHandler.middleware.js";

const app = express();
const port = 3000;

app.use(express.json());


// Logging Middleware
app.use((req, _res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
 
// Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);


app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "pos-api",
  });
});

// error handler
app.use(erroHandlerMiddleware);
app.use((req, res) => {
    res.status(404).json({
        error: "NOT_FOUND",
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
});

app.listen(port, () => {
  console.log(`POS API listening on http://localhost:${port}`);
});