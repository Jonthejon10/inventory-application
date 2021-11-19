#! /usr/bin/env node

console.log(
	'This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true'
)

// Get arguments passed on command line
var userArgs = process.argv.slice(2)
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Game = require('./models/game')
var Genre = require('./models/genre')

var mongoose = require('mongoose')
var mongoDB = userArgs[0]
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = global.Promise
var db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

let games = []
let genres = []

function gameCreate(name, description, genre, price, number_in_stock, cb) {
    gamedetail = {
        name: name,
        description: description,
        genre: genre,
        price: price,
        number_in_stock: number_in_stock
    }

	const game = new Game(gamedetail)

	game.save(function (err) {
		if (err) {
            cb(err, null)
			return
		}
        games.push(game)
		cb(null, game)
	})
}

function genreCreate(name, description, cb) {
    genredetail = {
        name: name,
        description: description
    }

	const genre = new Genre(genredetail)
	genre.save(function (err) {
		if (err) {
			cb(err, null)
			return
		}
        genres.push(genre)
		cb(null, genre)
	})
}

function createGenre(cb) {
	async.series(
		[
			function (callback) {
                genreCreate(
					'Action-adventure',
					"An action adventure game can be defined as a game with a mix of elements from an action game and an adventure game, especially crucial elements like puzzles. The story is heavily reliant upon the player character's movement, which triggers story events and thus affects the flow of the game.",
					callback
				)
			},
			function (callback) {
                genreCreate(
                    'First Person Shooter',
                    "First-person shooter (FPS) is a sub-genre of shooter video games centered on gun and other weapon-based combat in a first-person perspective, with the player experiencing the action through the eyes of the protagonist and controlling the player character in a three-dimensional space.",
                    callback
                )
			},
			function (callback) {
                genreCreate(
                    'Action role-playing',
                    "Action role-playing video games (abbreviated action RPG or ARPG) are a subgenre of role-playing video games. The games emphasize real-time combat (where the player has direct control over characters) over turn-based or menu-based combat.",
                    callback
                )
			},
		],
		// optional callback
		cb
	)
}

function createGames(cb) {
	async.parallel(
		[
			function (callback) {
				gameCreate(
					'God of War',
					"In God of War, players control Kratos, a Spartan warrior who is sent by the Greek gods to kill Ares, the god of war. As the story progresses, Kratos is revealed to be Ares' former servant, who had been tricked into killing his own family and is haunted by terrible nightmares.",
                    [genres[0]],
                    14.99,
                    10,
					callback
				)
			},
			function (callback) {
				gameCreate(
					'The Last of Us',
                    'Set in the post-apocalyptic United States, the game tells the story of survivors Joel and Ellie as they work together to survive their westward journey across what remains of the country to find a possible cure for the modern fungal plague that has nearly decimated the entire human race.',
                    [genres[0]],
                    9.99,
                    5,
					callback
				)
			},
			function (callback) {
				gameCreate(
					'Red Dead Redemption II',
                    "Set in a fictional recreation of the American Old West in 1899, Red Dead Redemption 2 focuses on the life of Arthur Morgan and his position in the notorious Van der Linde gang. The game follows the gang's decline as they are pursued by lawmen, fellow gangs and Pinkerton agents. The narrative revolves around the characters of Dutch van der Linde, John Marston and Micah Bell in addition to Morgan. ",
                    [genres[0]],
                    19.99,
                    2,
					callback
				)
			},
			function (callback) {
				gameCreate(
					'Doom (2016)',
                    'The game features the Doom Slayer, an ancient warrior awakened during a demonic invasion on Mars in 2148 after the Union Aerospace Corporation scientist Dr. Olivia Pierce allows forces of Hell to invade. ',
                    [genres[1]],
                    11.99,
                    11,
					callback
				)
			},
			function (callback) {
				gameCreate(
					'Bloodborne',
                    "Bloodborne follows the player's character, a Hunter, through the decrepit Gothic, Victorian-era–inspired city of Yharnam, whose inhabitants are afflicted with a blood-borne disease. Attempting to find the source of the plague, the player's character unravels the city's mysteries while fighting beasts and cosmic beings.",
                    [genres[2]],
                    9.99,
                    15,
					callback
				)
			},
			function (callback) {
				gameCreate(
					'Horizon Zero Dawn',
					'The plot follows Aloy, a young hunter in a world overrun by machines, who sets out to uncover her past. The player can explore the open world to discover locations and take on side quests.',
                    [genres[2]],
                    13.99,
                    7,
					callback
				)
			},
		],
		// optional callback
		cb
	)
}

async.series(
	[createGenre, createGames],
	// Optional callback
    function (err, results) {
		if (err) {
			console.log('FINAL ERR: ' + err)
		} else {
			console.log(results)
		}
		// All done, disconnect from database
		mongoose.connection.close()
	}
)
