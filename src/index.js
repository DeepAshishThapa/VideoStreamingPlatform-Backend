
import dotenv from "dotenv"
import connectDB from './db/index.js'
import app from './app.js'

dotenv.config({
       path: './.env'
})

await connectDB()


const PORT=process.env.PORT || 8000

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`)
})
