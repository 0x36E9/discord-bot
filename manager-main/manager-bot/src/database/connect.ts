import mongoose from "mongoose";

class Database {
  private uri: string;

  constructor(uri: string) {
    this.uri = uri;
  }

  async connect(): Promise<void> {
    await mongoose.set("strictQuery", true);
    await mongoose.connect(this.uri);
    console.log("database ready!");
  }
}

export default Database;
