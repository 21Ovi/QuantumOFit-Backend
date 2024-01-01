import express from "express";

import authRoutes from "./routes/auth-routes";
import pool from "./db/db";
import { errorHandler } from "./middlewares/error-handler";
import { asyncHandler } from "./middlewares/async-handler";
import { notFoundHandler } from "./middlewares/not-found-handler";

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Authentication routes
app.use("/auth", authRoutes);

// Error handling middleware
app.use(errorHandler);

// Async handler middleware example
app.post(
  "/async-example",
  asyncHandler(async (req, res) => {
    // Asynchronous logic here
  })
);

// 404 handler middleware
app.use(notFoundHandler);

pool.connect((err: any, client: any) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to database");
    client.release();
  }
});

app.listen(port, () => {
  console.log(`Server is running at PORT ${port}`);
});
