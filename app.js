const express = require('express')
const movies = require('./movies.json')
const crypto = require('node:crypto')
const app = express()
// MIDDLEWARE PARA LEER POSTS
app.use(express.json())
// AUTENTICADOR DE ZOD PROPIO
const {validateMovie, validatePartial} = require('./auth')
app.disable('x-powered-by')
const port = process.env.PORT ?? 1234
const ACCEPTED_ORIGINS = ['http://localhost:8080','*']

// app.get('/',(req,res)=>{
//     res.json("hola mundo")
// })

// GET ALL MOVIES OR BY GENRE
app.get('/',(req,res)=>{
    res.header('Access-Control-Allow-Origin','*')
    const {genre} = req.query
    if(genre){
        const filteredMovies = movies.filter(movie=>movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()))
        return res.json(filteredMovies)
    }
    res.json(movies)
})
// GET BY ID
app.get('/movies/:id',(req,res)=>{
    const {id} = req.params
    const movie = movies.find(movie => movie.id == id)

    if(movie) return res.json(movie)
    
    res.status(404).json({ message: "not encontrado"})
})
// POST
app.post('/movies',(req,res)=>{
    const result = validateMovie(req.body)
    if(result.error){
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }
    const newMovie ={
        id: crypto.randomUUID(),
        ...result.data
    }

    movies.push(newMovie)
    res.status(201).json(newMovie)
})
// PATCH
app.patch('/movies/:id',(req,res)=>{
    const result = validatePartial(req.body)
    if(!result.success){
        res.status(404).json({error : JSON.parse(result.error.message)})
    }
    const {id} = req.params
    const movieIndex = movies.findIndex(movie => movie.id == id)
    if(movieIndex == -1){
        res.status(404).json({message:"not found movie"})
    }
    const updateMovie ={
        ...movies[movieIndex],
        ...result.data
    }
    movies[movieIndex] = updateMovie
    return res.json(updateMovie)
})
// METODO ESPECIAL PARA CORS DESDE DESDE DELETE PATCH Y PUT
app.options('/movies/:id',(req,res)=>{
    const origin = req.header('origin')
    if(ACCEPTED_ORIGINS.includes(origin)){
        res.header('Access-Control-Allow-Origin',origin)
        res.header('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE')
    }
    res.send(200)
})
// DELETE
app.delete('/movies/:id',(req,res)=>{
    res.header('Access-Control-Allow-Origin','*')
    const {id} = req.params
    const movieIndex = movies.findIndex(movie=> movie.id === id)
    if(movieIndex == -1){
        return res.status(400).json({message: "movie not found"})
    }
    movies.splice(movieIndex,1)
    return res.status(204).json({message:"movie deleted"})
})
app.listen(port,()=>{
    console.log(`Server Listen at http://localhost:${port}`)
})