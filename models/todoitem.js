const moment = require('moment')

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TodoItemSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  priority: { type: Number, default: 1 },
  deleted: { type: Boolean, default: false },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { type: String },
  dates: { type: Array }
})

TodoItemSchema
  .virtual('startMonth')
  .get(function () {
    return moment(this.startDate).format('YYYY-MM')
  })

TodoItemSchema
  .virtual('startDay')
  .get(function () {
    return moment(this.startDate).format('DD')
  })
TodoItemSchema
  .virtual('endMonth')
  .get(function () {
    return moment(this.endDate).format('YYYY-MM')
  })

TodoItemSchema
  .virtual('endDay')
  .get(function () {
    return moment(this.endDate).format('DD')
  })

TodoItemSchema
  .virtual('completedMonth')
  .get(function () {
    return this.completedAt ? moment(this.completedAt).format('YYYY-MM') : ''
  })

TodoItemSchema
  .virtual('completedDay')
  .get(function () {
    return this.completedAt ? moment(this.completedAt).format('DD') : ''
  })

module.exports = mongoose.model('TodoItem', TodoItemSchema)