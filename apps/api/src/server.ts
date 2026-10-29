
import express from "express";
import cookieParser from "cookie-parser";
// routes
import productRoutes from "./modules/products/products.routes.js"
import authRoutes from "./modules/auth/auth.routes.js"
import meRoutes from "./modules/auth/me.routes.js"
import besinessesRoutes from "./modules/businesses/businesses.routes.js"
// middlewares
import { erroHandlerMiddleware } from "./middlewares/errorHandler.middleware.js";
import { authTokenMiddleware } from "./middlewares/authToken.middleware.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "pos-api",
  });
});


// Logging Middleware
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
  

// Routes
app.use("/api/auth", authRoutes);
app.use(authTokenMiddleware)
app.use("/api/me", meRoutes);
app.use("/api/products", productRoutes);
app.use("/api/businesses", besinessesRoutes);




// error handler
app.use((req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use(erroHandlerMiddleware);

app.listen(port, () => {
  console.log(`POS API listening on http://localhost:${port}`);
});