import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; 
import authRoutes from "./routes/authRoutes.js";

// 3. Create the app

dotenv.config();
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

const MONGO_URI = process.env.MONGO_URI 
const PORT = process.env.PORT || 5000;

await connectDB(MONGO_URI);

app.get ("/", (req, res) => {
    res.send("vanakammmmm.....");
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

