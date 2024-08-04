const z = require('zod')

const MovieScheme = z.object({
    title:z.string({
        invalid_type_error:"movie title is invalid",
        message:"error"
    }),
    year:z.number().int().min(1899).max(2025),
    director:z.string(),
    rate:z.number().min(0).max(10),
    duration:z.number().positive(),
    poster: z.string().url(),
    genre: z.array(
        z.enum(["Romantic","Adventure","Love","Sci-Fi", "Drama","Romance","Crime",])
    )
})

function validateMovie (object){
    return MovieScheme.safeParse(object)
}
function validatePartial (obj){
    return MovieScheme.partial().safeParse(obj)
}

module.exports ={
    validateMovie,
    validatePartial
}