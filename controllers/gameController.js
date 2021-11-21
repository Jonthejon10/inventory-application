const Game = require('../models/game')
const Genre = require('../models/genre')
const multer = require('multer')
const path = require('path')
const { body, validationResult } = require('express-validator')

const async = require('async')

const imgDestination = path.join(__dirname, '../public/images/')

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imgDestination)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({storage: fileStorageEngine})

// GAME LIST
exports.game_list = (req, res, next) => {
    Game.find({}, 'name genre price number_in_stock img_name')
		.sort({ name: 1 })
		.populate('genre')
		.populate('img_name')
		.exec((err, list_games) => {
			if (err) {
				return next(err)
			}
			res.render('game_list', {
				title: 'Games catalog',
				game_list: list_games,
			})
		})
}

// INDIVIDUAL GAME DETAIL
exports.game_detail = (req, res, next) => {
    
    async.parallel({
        game: (callback) => {
            Game.findById(req.params.id)
                .populate('genre')
                .exec(callback)
        },
    }, (err, results) => {
        if (err) { return next(err) }
        if (results.game == null) {
            const err = new Error('Game not found')
            err.status = 404
            return next(err)
        }

        res.render('game_detail', {title: results.game.name, game: results.game})
    })
}

// GAME CREATE GET
exports.game_create_get = (req, res, next) => {
    
    async.parallel({
        genres: (callback) => {
            Genre.find(callback)
        },
    }, (err, results) => {
        if (err) { return next(err); }
        res.render('game_form', {title: 'Add a game', genres: results.genres})
    })
}

// GAME CREATE POST
exports.game_create_post = [
    // Convert genre to array
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined') {
                req.body.genre = []
            } else {
                req.body.genre = new Array(req.body.genre)
            }
        }
        next()
    },
    
    upload.single('game_cover'),
    //  Validation and sanitization of fields
    body('name', 'Name must not be empty.').trim().isLength({min: 1}).escape(),
    body('description', 'Description must not be empty.').trim().isLength({min: 1}).escape(),
    body('genre.*').escape(),
    body('price', 'Price must not be empty.').trim().isLength({min: 1}).escape(),
    body('stock', 'Stock must not be empty.').trim().isLength({ min: 1 }).escape(),
    
    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract validation erros from request
        const errors = validationResult(req)

        // Create Game object with escaped and trimmed data
        const game = new Game(
            {
                name: req.body.name,
                description: req.body.description,
                genre: req.body.genre,
                price: req.body.price,
                number_in_stock: req.body.stock,
            }
		)
		
		if (req.file) {
            game.img_name = req.file.filename
		}
		

        if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/error messages.

			// Get genres for form
			async.parallel(
				{
					genres: (callback) => {
						Genre.find(callback)
					},
				},
				(err, results) => {
					if (err) {
						return next(err)
					}

					// Mark selected genres as checked.
					for (let i = 0; i < results.genres.length; i++) {
						if (game.genre.indexOf(results.genres[i]._id) > -1) {
							results.genres[i].checked = 'true'
						}
					}
					res.render('game_form', {
						title: 'Create game',
						genres: results.genres,
                        game: game,
						errors: errors.array(),
					})
				}
			)
			return
		} else {
			// Data from form is valid. Save game.
			game.save(function (err) {
				if (err) {
					return next(err)
				}
				//successful - redirect to new game record.
				res.redirect(game.url)
			})
		}
    }
]

// GAME DELETE GET
exports.game_delete_get = (req, res, next) => {
    async.parallel(
		{
			game: (callback) => {
				Game.findById(req.params.id).exec(callback)
			},
		}, (err, results) => {
			if (err) {
				return next(err)
			}
			if (results.game == null) {
				res.redirect('/catalog/')
			}

			res.render('game_delete', {
				game: results.game,
			})
		}
	)
}

// GAME DELETE POST
exports.game_delete_post = (req, res, next) => {
    async.parallel({
        game: (callback) => {
            Game.findById(req.params.id).exec(callback)
        },
    }, (err, results) => {
        if (err) {
            return next(err)
        }
        Game.findByIdAndRemove(
            req.body.gameid,
            function deletegame(err) {
                if(err) {
                    return next(err)
                }
                res.redirect('/catalog/')
            }

        )
    })
}

// GAME UPDATE GET
exports.game_update_get = function (req, res, next) {
	
    async.parallel(
		{
			game: function (callback) {
				Game.findById(req.params.id)
					.populate('genre')
					.exec(callback)
			},
			genres: function (callback) {
				Genre.find(callback)
			},
		},
		function (err, results) {
			if (err) {
				return next(err)
			}
			if (results.game == null) {
				// No results.
				var err = new Error('game not found')
				err.status = 404
				return next(err)
			}
			// Mark selected genres as checked.
			for (
				var all_g_iter = 0;
				all_g_iter < results.genres.length;
				all_g_iter++
			) {
				for (
					var game_g_iter = 0;
					game_g_iter < results.game.genre.length;
					game_g_iter++
				) {
					if (
						results.genres[all_g_iter]._id.toString() ===
						results.game.genre[game_g_iter]._id.toString()
					) {
						results.genres[all_g_iter].checked = 'true'
					}
				}
			}
			res.render('game_form', {
				title: 'Update game',
				genres: results.genres,
				game: results.game,
			})
		}
	)
}
// GAME UPDATE POST
exports.game_update_post = [
	// Convert the genre to an array
	(req, res, next) => {
		if (!(req.body.genre instanceof Array)) {
			if (typeof req.body.genre === 'undefined') req.body.genre = []
			else req.body.genre = new Array(req.body.genre)
		}
		next()
	},
	upload.single('game_cover'),

	// Validate and sanitise fields.
	body('name', 'Name must not be empty.')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body('description', 'Description must not be empty.')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body('genre.*').escape(),
	body('price', 'Price must not be empty.')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body('stock', 'Stock number must not be empty')
		.trim()
		.isLength({ min: 1 })
		.escape(),

	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req)

		// Create a game object with escaped/trimmed data and old id.
		const game = new Game({
			name: req.body.name,
			description: req.body.description,
			genre: typeof req.body.genre === 'undefined' ? [] : req.body.genre,
			price: req.body.price,
			number_in_stock: req.body.stock,
			_id: req.params.id,
		})

		if (req.file) {
			game.img_name = req.file.filename
		}

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/error messages.

			// Get all genres
			async.parallel(
				{
					genres: function (callback) {
						Genre.find(callback)
					},
				},
				function (err, results) {
					if (err) {
						return next(err)
					}

					// Mark selected genres as checked.
					for (let i = 0; i < results.genres.length; i++) {
						if (game.genre.indexOf(results.genres[i]._id) > -1) {
							results.genres[i].checked = 'true'
						}
					}
					res.render('game_form', {
						title: 'Update game',
						genres: results.genres,
						game: game,
						errors: errors.array(),
					})
				}
			)
			return
		} else {
			// Data from form is valid. Update the record.
			Game.findByIdAndUpdate(
				req.params.id,
				game,
				{},
				function (err, thegame) {
					if (err) {
						return next(err)
					}
					// Successful - redirect to game detail page.
					res.redirect(thegame.url)
				}
			)
		}
	},
]

