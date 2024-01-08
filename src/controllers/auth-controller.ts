import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/db"; // Adjust the path based on your project structure

interface User {
  user_role: string;
  id: number;
  email: string;
  password: string;
  // Add other user properties as needed
}

export const registerGym = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Extract gym details including address from the request body
    const {
      name,
      location,
      membership_fees,
      type,
      country,
      state,
      city,
      pincode,
      members_count,
      gym_company,
      gym_type,
    } = req.body;

    // Check if the gym with the given name already exists
    const existingGym = await pool.query("SELECT * FROM gyms WHERE name = $1", [
      name,
    ]);

    if (existingGym.rows.length > 0) {
      res.status(400).json({ error: "Gym with this name already exists" });
      return;
    }

    // Start a transaction to ensure data consistency
    const client = await pool.connect();
    try {
      // Insert the gym address into the addresses table
      const addressResult = await client.query(
        "INSERT INTO addresses (country, state, city, pincode) VALUES ($1, $2, $3, $4) RETURNING id",
        [country, state, city, pincode]
      );

      const addressId = addressResult.rows[0].id;

      // Insert the gym details along with the address_id into the gyms table
      const gymResult = await client.query(
        "INSERT INTO gyms (name, address_id, membership_fees, type, members_count, gym_company, location, gym_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
        [
          name,
          addressId,
          membership_fees,
          type,
          members_count,
          gym_company,
          location,
          gym_type,
        ]
      );

      // Commit the transaction
      await client.query("COMMIT");

      // Send the registered gym details in the response
      res.status(201).json({
        message: "Gym registered successfully",
        gym: gymResult.rows[0],
      });
    } catch (error) {
      // Rollback the transaction in case of an error
      await client.query("ROLLBACK");
      throw error;
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error("Error during gym registration:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      username,
      email,
      password,
      fullName,
      dateOfBirth,
      weight,
      height,
      gymId,
    } = req.body;

    // Check if the user with the provided email already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      res
        .status(400)
        .json({ error: "User with the provided email already exists" });
    }

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the users table
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password, full_name, date_of_birth, weight, height, gym_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        username,
        email,
        hashedPassword,
        fullName,
        dateOfBirth,
        weight,
        height,
        gymId,
      ]
    );

    res
      .status(201)
      .json({ message: "User registration successful", user: newUser.rows[0] });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Retrieve the user from the database
    const userResult = await pool.query<User>(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    // Check if the user exists
    if (userResult.rows.length === 0) {
      res.status(401).json({ error: "Invalid email or password" });
    }

    const user: User = userResult.rows[0];

    // Compare the provided password with the hashed password in the database
    const encryptionChecked = await bcrypt.compare(password, user.password);
    const basicCheck = user.password === password;

    const checkPassword =
      user.user_role === "superadmin" ? basicCheck : encryptionChecked;

    if (!checkPassword) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Generate a JWT token for authentication
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      "quantamtoaifitness", // Replace with a secure secret key
      { expiresIn: "48h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logoutUser = (req: Request, res: Response): void => {
  // You can add logout logic here based on your authentication strategy
  res.send("Logout functionality will be implemented here.");
};
