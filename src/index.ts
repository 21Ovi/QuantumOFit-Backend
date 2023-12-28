import express from "express";
import authRoutes from "./routes/auth-routes";

const app = express();
const port = 3000;

// Authentication routes
app.use("/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server is running at PORT ${port}`);
});
