import { Pool } from "pg";

// Create a new Pool instance with your PostgreSQL connection details
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "QuantamOFit",
  password: "Rheaghar4314",
  port: 5432,
});

// Export the pool instance for use in other files
export default pool;
