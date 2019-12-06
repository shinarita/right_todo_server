const express = require('express')
const router = express.Router()
const todo_list_controller = require('../controllers/todoController')
const auth_controller = require('../controllers/authController')
const auth = require('../middlewares/auth')

router.get('/todo/list/:date', auth, todo_list_controller.todo_list_date_get)

router.put('/todo/item/:id', auth, todo_list_controller.todo_item_update)

router.post('/todo/item', auth, todo_list_controller.todo_item_add)

router.get('/todo/item/:id', auth, todo_list_controller.todo_item_get)

router.delete('/todo/item/:id', auth, todo_list_controller.todo_item_delete)

router.post('/auth/login', auth_controller.auth_login)

router.get('/todo/history/list/:month', auth, todo_list_controller.todo_item_history_month_get)

module.exports = router