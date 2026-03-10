import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL)
    console.log("Đã kết nối với MongoDB")}
    catch (err) {console.log(err)}}

export default connectDB;