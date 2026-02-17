
import connectDB from './db/index.js'
import dotenv from "dotenv"
import app from './app.js'

dotenv.config()

await connectDB()


const PORT=process.env.PORT || 8000

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`)
})
