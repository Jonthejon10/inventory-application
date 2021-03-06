const mongoose = require('mongoose')

const Schema = mongoose.Schema

const GenreSchema = new Schema({
	name: { type: String, required: true, maxLength: 100 },
	description: { type: String, required: true},
})

GenreSchema.virtual('url').get(function () {
	return '/genres/genre/' + this._id
})

module.exports = mongoose.model('Genre', GenreSchema)
