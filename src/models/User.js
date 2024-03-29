import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    maxLength: [30, "Cannot be more than 30 characters"],
  },
  email: { 
    type: String,
    required: true,
    unique: true 
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: { 
    type: String 
  },
});

export default mongoose.model("User", userSchema);
