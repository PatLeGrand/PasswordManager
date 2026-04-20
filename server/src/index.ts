import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'

dotenv.config();
import authRouter from './routes/auth.routes'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
