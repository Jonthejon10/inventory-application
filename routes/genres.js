var express = require('express')
var router = express.Router()

const genre_controller = require('../controllers/genreController')

// GET request for new genre.
router.get('/create', genre_controller.genre_create_get)

// POST request for new genre.
router.post('/create', genre_controller.genre_create_post)

// GET request to delete genre.
router.get('/genre/:id/delete', genre_controller.genre_delete_get)

// POST request to delete genre.
router.post('/genre/:id/delete', genre_controller.genre_delete_post)

// GET request to update genre.
router.get('/genre/:id/update', genre_controller.genre_update_get)

// POST request to update genre.
router.post('/genre/:id/update', genre_controller.genre_update_post)

// GET request for one genre.
router.get('/genre/:id', genre_controller.genre_detail)

// GET request for list of all genre items.
router.get('/', genre_controller.genre_list)



module.exports = router
