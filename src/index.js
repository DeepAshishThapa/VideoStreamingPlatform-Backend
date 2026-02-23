
import dotenv from "dotenv"
dotenv.config({
       path: './.env'
})
import connectDB from './db/index.js'
import app from './app.js'



await connectDB()


const PORT=process.env.PORT || 8000

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`)
})
