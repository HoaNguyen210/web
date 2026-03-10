const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User Schema (inline to avoid importing model issues)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Demo user credentials
const DEMO_USER = {
  email: "admin@gmail.com",
  password: "Admin@123",
  name: "Admin User",
};

async function seed() {
  try {
    // Connect to MongoDB
    const mongoUrl = process.env.MONGODB_URL;
    
    if (!mongoUrl) {
      console.error("Error: MONGODB_URL is not defined in environment variables");
      console.log("Please add MONGODB_URL to your .env file");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB");

    // Check if user already exists
    const existingUser = await User.findOne({ email: DEMO_USER.email });
    
    if (existingUser) {
      // Update with correct password and name
      const hashedPassword = await bcrypt.hash(DEMO_USER.password, 10);
      existingUser.password = hashedPassword;
      existingUser.name = DEMO_USER.name;
      await existingUser.save();
      
      console.log("Demo user already exists - updated password and name");
      console.log(`Email: ${existingUser.email}`);
      console.log(`Name: ${DEMO_USER.name}`);
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash(DEMO_USER.password, 10);
      
      // Create the user
      const newUser = new User({
        email: DEMO_USER.email,
        password: hashedPassword,
        name: DEMO_USER.name,
      });

      await newUser.save();
      console.log("Demo user created successfully!");
      console.log(`Email: ${DEMO_USER.email}`);
      console.log(`Password: ${DEMO_USER.password}`);
      console.log(`Name: ${DEMO_USER.name}`);
    }

    console.log("\nSeeding completed!");
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();

