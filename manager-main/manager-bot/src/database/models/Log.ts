import mongoose from "mongoose";
import moment from "moment";

const schema = new mongoose.Schema({
  userid: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, default: moment().format('MMMM Do YYYY, h:mm:ss a') },
});

export default mongoose.model<
  mongoose.Document & {
    userid?: string;
    description?: string;
    date?: string;
  }
>("Log", schema);
