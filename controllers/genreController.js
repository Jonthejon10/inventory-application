const Genre = require('../models/genre')
const Game = require('../models/game')

const { body, validationResult } = require('express-validator')

const async = require('async')

// GENRE LIST
exports.genre_list = (req, res, next) => {
	Genre.find({}, 'name')
		.sort({ name: 1 })
		.exec((err, list_genres) => {
			if (err) {
				return next(err)
			}
			res.render('genre_list', {
				title: 'Genres catalog',
				genre_list: list_genres,
			})
		})
}

// INDIVIDUAL GENRE PAGE
exports.genre_detail = (req, res, next) => {
	async.parallel({
		genre: (callback) => {
			Genre.findById(req.params.id)
				.exec(callback)
		},
	}, (err, results) => {
		if (err) { return next(err) }
		if (results.genre == null) {
			const err = new Error('Genre not found')
			err.status = 404
			return next(err)
		}

		res.render('genre_detail', {title: results.genre.name, genre: results.genre})
	})
}

// CREATE GENRE GET
exports.genre_create_get = (req, res, next) => {
	res.render('genre_form', { title: 'Create Genre' })
}

// GENRE CREATE POST
exports.genre_create_post = [
	// Validate and santize the name field.
	body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),
	body('description', 'Genre description required').trim().isLength({ min: 1 }).escape(),

	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req)

		// Create a genre object with escaped and trimmed data.
		const genre = new Genre({ name: req.body.name, description: req.body.description})

		if (!errors.isEmpty()) {
			// There are errors. Render the form again with sanitized values/error messages.
			res.render('genre_form', {
				title: 'Create Genre',
				genre: genre,
				errors: errors.array(),
			})
			return
		} else {
			// Data from form is valid.
			// Check if Genre with same name already exists.
			Genre.findOne({ name: req.body.name }).exec(function (
				err,
				found_genre
			) {
				if (err) {
					return next(err)
				}

				if (found_genre) {
					// Genre exists, redirect to its detail page.
					res.redirect(found_genre.url)
				} else {
					genre.save(function (err) {
						if (err) {
							return next(err)
						}
						// Genre saved. Redirect to genre detail page.
						res.redirect(genre.url)
					})
				}
			})
		}
	},
]

// GENRE DELETE GET
exports.genre_delete_get = (req, res, next) => {
	async.parallel(
		{
			genre: (callback) => {
				Genre.findById(req.params.id).exec(callback)
			},
			games: (callback) => {
				Game.find({genre: req.params.id}).exec(callback)
			}
		},
		(err, results) => {
			if (err) {
				return next(err)
			}
			if (results.genre == null) {
				res.redirect('/genres/')
			}

			res.render('genre_delete', {
				genre: results.genre,
				games: results.games
			})
		}
	)
}


// GENRE DELETE POST
exports.genre_delete_post = (req, res, next) => {
	async.parallel(
		{
			genre: (callback) => {
				Genre.findById(req.body.genreid).exec(callback)
			},
			games: (callback) => {
				Game.find({genre: req.body.genreid}).exec(callback)
			},
		},
		(err, results) => {
			if (err) {
				return next(err)
			}
			if (results.games.length > 0) {
				res.render('genre_delete', {
					genre: results.genre,
					games: results.games,
				})
				return
			} else {
				// Genre has no games. Delete object and redirect to the list of genres.
				Genre.findByIdAndRemove(
					req.body.genreid,
					function deleteGenre(err) {
						if (err) {
							return next(err)
						}
						// Success - go to author list
						res.redirect('/genres/')
					}
				)
			}
		}
	)
}

//GENRE UPDATE GET
exports.genre_update_get = (req, res) => {
	async.parallel(
		{
			genre: function (callback) {
				Genre.findById(req.params.id).exec(callback)
			},
		},
		function (err, results) {
			if (err) {
				return next(err)
			}
			if (results.genre == null) {
				let err = new Error('Genre not found')
				err.status = 404
				return next(err)
			}
			res.render('genre_form', {
				title: 'Update Genre',
				genre: results.genre,
			})
		}
	)
}

//GENRE UPDATE POST
exports.genre_update_post = [
	// Validate and santize the fields.
	body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),
	body('description', 'Description required').trim().isLength({ min: 1 }).escape(),

	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req)

		// Create a genre object with escaped and trimmed data.
		const genre = new Genre({ name: req.body.name, description: req.body.description, _id: req.params.id })

		if (!errors.isEmpty()) {
			// There are errors. Render the form again with sanitized values/error messages.
			res.render('genre_form', {
				title: 'Update Genre',
				genre: genre,
				errors: errors.array(),
			})
			return
		} else {
			// Data from form is valid. Update the genre.
			Genre.findByIdAndUpdate(
				req.params.id,
				genre,
				{},
				function (err, thegenre) {
					if (err) {
						return next(err)
					}
					// Successful - redirect to genre detail page.
					res.redirect(thegenre.url)
				}
			)
		}
	},
]
