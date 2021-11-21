var express = require('express');
var router = express.Router();

const game_controller = require('../controllers/gameController')

// GET request for new game.
router.get('/create', game_controller.game_create_get)

// POST request for new game.
router.post('/create', game_controller.game_create_post)

// GET request to delete game.
router.get('/game/:id/delete', game_controller.game_delete_get)

// POST request to delete game.
router.post('/game/:id/delete', game_controller.game_delete_post)

// GET request to update game.
router.get('/game/:id/update', game_controller.game_update_get)

// POST request to update game.
router.post('/game/:id/update', game_controller.game_update_post)

// GET request for one game.
router.get('/game/:id', game_controller.game_detail)

// GET request for list of all game items.
router.get('/', game_controller.game_list)


module.exports = router;
