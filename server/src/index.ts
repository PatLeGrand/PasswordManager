import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import serviceRoutes from './routes/service.routes'
import shareRoutes from "./routes/share.routes";

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/share', shareRoutes)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})