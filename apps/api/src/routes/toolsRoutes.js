const express = require('express')
const router = express.Router()
const optionalAuth = require('../middlewares/optionalAuth')
const toolsController = require('../controllers/toolsController')

router.post('/order-image', optionalAuth, toolsController.postOrderImage)

module.exports = router

