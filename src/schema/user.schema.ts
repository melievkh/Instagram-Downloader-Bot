import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  telegram_id: {
    type: String,
    required: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
  },
});

export default userSchema;
