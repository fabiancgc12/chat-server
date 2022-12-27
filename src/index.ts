import server from "./socketServer";

require('dotenv').config();

const port = process.env.PORT || 3001
server.listen(port, () => {
    console.log(`listening on *:${port}`);
});