const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      default: "member",
    },
    fileName: {
      type: String,
    },
    file: {
      data: Buffer,
      contentType: String,
    },
    uploadTime: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

module.exports = User = mongoose.model("User", UserSchema);
