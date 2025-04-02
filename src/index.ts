import * as dotenv from 'dotenv'
import { initServer } from "./app";

dotenv.config()
const PORT = 8000

async function init() {
    const app = await initServer()
    app.listen(PORT, () => {
        console.log(`Server running at port ${PORT}`)
    });
}

init();