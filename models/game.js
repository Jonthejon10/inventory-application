const mongoose = require('mongoose')

const Schema = mongoose.Schema

const GameSchema = new Schema(
    {
        name: {type: String, required: true, maxLength:100},
        description: {type: String, required: true},
        genre: [{type: Schema.Types.ObjectId, ref: 'Genre', required: true}],
        price: {type: Number, required: true},
        number_in_stock: { type: Number, required: true },
        img_name: {type: String, required: false}
    }
)

GameSchema.virtual('url').get(function () {
    return '/catalog/game/' + this._id
})

module.exports = mongoose.model('Game', GameSchema)

