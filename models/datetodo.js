const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DateTodoSchema = new Schema({
  todo: { type: Schema.Types.ObjectId, ref: 'TodoItem' },
  date: { type: String, required: true },
  done: { type: Boolean, default: false }
})

module.exports = mongoose.model('DateTodo', DateTodoSchema)