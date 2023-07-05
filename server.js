let server = require("./app");
const PORT = process.env.PORT;
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server start on port : ${PORT}`);
  });
}
