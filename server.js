require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/db");
connectToDB();

app.listen(3000, () => {
  console.log("App is listening at PORT 3000");
});
