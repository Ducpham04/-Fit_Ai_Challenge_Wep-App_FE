import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const app = express();

// ✅ Bật CORS cho mọi domain
app.use(cors());
app.use(express.json());

// Load Swagger file
const swaggerDocument = YAML.load("./src/api/FitChallenge-API.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Ví dụ mock API
app.get("/workouts", (req, res) => {
  res.json([
    { id: 1, name: "Pushups", duration: "30s" },
    { id: 2, name: "Squats", duration: "45s" },
  ]);
});



const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Mock server running at http://localhost:${PORT}`);
});
