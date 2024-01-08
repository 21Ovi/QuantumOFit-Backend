import express from "express";
import authRoutes from "./routes/auth-routes";
import pool from "./db/db";

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Authentication routes
app.use("/auth", authRoutes);

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
