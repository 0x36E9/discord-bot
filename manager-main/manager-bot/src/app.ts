import config from "./config";
import { client } from "./client/bot";
import Database from "./database/connect";

const database = new Database(config.DATABASE);

database.connect();

client.login(config.TOKEN);
