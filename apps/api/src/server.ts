
import express from "express";
import productRoutes from "./modules/products/products.routes.js"

const app = express();
const port = 3000;

app.use(express.json());


// Logging Middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });



app.use("/api/products", productRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "pos-api",
  });
});


app.get("/error", (_req, _res, next) => {
    next(new Error("Test database failure"));
});

// error handler
app.use((req, res) => {
    res.status(404).json({
        error: "NOT_FOUND",
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
});


// error handler
app.use(
    (
      err: Error,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error(err);
  
      if (res.headersSent) {
        return next(err);
      }
  
      res.status(500).json({
        error: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
      });
    },
);

app.listen(port, () => {
  console.log(`POS API listening on http://localhost:${port}`);
});