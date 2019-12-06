const TodoItem = require('../models/todoitem')
const DateTodo = require('../models/datetodo')
const moment = require('moment')
const { getWeekdaysInRange, getSpecialDatesInRange, getDaysInRange } = require('../utils')

const CompletedKey = 'completed'
const UnCompletedKey = 'uncompleted'

// reference：https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
exports.todo_list_date_get = async (req, res, next) => {
  const { date: queryDate } = req.params
  try {
    const dateTodos = await DateTodo.find({ date: queryDate })
    let completed = []
    let uncompleted = []
    await Promise.all(dateTodos.map(async item => {
      const todo = await TodoItem.findOne({ _id: item.todo.toString(), deleted: false })
      const { deleted, description, title, endDate, startDate, user, priority, type, _id,
        dates } = todo
      const { done } = item
      const data = {
        deleted, description, title, endDate, startDate, user, priority, type, id: _id,
        dates, done
      }
      done && completed.push(data)
      !done && uncompleted.push(data)
    }))
    res.send({
      queryDate,
      completed,
      uncompleted
    })
  } catch (err) {
    console.log(err)
    return next(err)
  }
}

exports.todo_item_update = (req, res, next) => {
  const { id } = req.params
  if (req.body.done) {
    DateTodo.findOneAndUpdate({ todo: id, date: req.body.date }, { done: true })
      .exec((err, data) => {
        if (err) {
          return next(err)
        }
        res.send(data)
      })
  } else {
    TodoItem.findOneAndUpdate({ _id: id }, { ...req.body })
      .exec((err, data) => {
        if (err) {
          return next(err)
        }
        res.send(data)
      })
  }

}

exports.todo_item_add = async (req, res, next) => {
  const { user, title, description, priority, startDate, endDate, dates, type } = req.body
  try {
    let newItem = await new TodoItem({
      user, title, description, priority, startDate, endDate, done: false, deleted: false, type, dates
    }).save()
    let itemDates = []
    if (type === 'week') {
      itemDates = getWeekdaysInRange(startDate, endDate, dates)
    } else if (type === 'month') {
      itemDates = getSpecialDatesInRange(startDate, endDate, dates)
    } else {
      itemDates = getDaysInRange(startDate, endDate)
    }
    await DateTodo
      .insertMany(itemDates.map(item => ({ date: item, todo: newItem._id })))
    res.send('OK')
  } catch (err) {
    console.log(err)
    return next(err)
  }
}

exports.todo_item_delete = async (req, res, next) => {
  const { id } = req.params
  try {
    await DateTodo.deleteMany({ todo: id })
    await TodoItem.findOneAndUpdate({ _id: id }, { deleted: true })
    res.send('OK')
  } catch (err) {
    console.log(err)
    return next(err)
  }
}

exports.todo_item_get = async (req, res, next) => {
  const { id } = req.params
  TodoItem.findById(id)
    .exec((err, data) => {
      if (err) {
        return next(err)
      }
      res.send(data)
    })
}

exports.todo_item_history_month_get = async (req, res, next) => {
  // month:2019-09
  const { month: queryMonth } = req.params
  const monthDayCount = moment(queryMonth, 'YYYY-MM').daysInMonth()
  let allDays = {}
  Array.from({ length: monthDayCount }).map((v, i) => {
    allDays[`${queryMonth}-${(i + 1).toString().padStart(2, '0')}`] = {
      [CompletedKey]: [],
      [UnCompletedKey]: []
    }
  })
  try {
    const todos = await DateTodo.find({ date: { $gte: `${queryMonth}-01`, $lte: `${queryMonth}-${monthDayCount}` } })
    const itemIdArray = todos.map(item => item.todo)
    const list = await TodoItem.find({ _id: { $in: itemIdArray }, deleted: false })
    await todos.forEach(async function (item) {
      const data = await list.find(li => {
        return li._id.toString() === item.todo.toString()
      })
      const { title, description, _id } = data
      const todoItem = {
        date: item.date,
        done: item.done,
        title,
        description,
        id: _id
      }
      allDays[item.date][item.done ? CompletedKey : UnCompletedKey].push(todoItem)
    })
    res.send(allDays)
  } catch (err) {
    console.log(err)
    return next(err)
  }
  // TodoItem.find({ startDate: { $gte: `${queryMonth}-01`, $lte: `${queryMonth}-${monthDayCount}` } })
  //   .exec((err, list) => {
  //     if (err) {
  //       return next(err)
  //     }
  //     let allDays = {}
  //     Array.from({ length: monthDayCount }).map((v, i) => {
  //       allDays[`${queryMonth}-${(i + 1).toString().padStart(2, '0')}`] = {
  //         [CompletedKey]: [],
  //         [UnCompletedKey]: []
  //       }
  //     })
  //     list.forEach(item => {
  //       const { startDate, endDate, done, startMonth, endMonth, startDay, endDay,
  //         completedMonth, completedDay
  //       } = item
  //       if (done) {
  //         // 已经完成
  //         if (startDate === endDate) {
  //           allDays[startDate][CompletedKey].push(item)
  //         } else {
  //           const onlyOneMonth = startMonth === endMonth || startMonth === completedMonth
  //           const lastDay = onlyOneMonth ? completedDay : monthDayCount
  //           for (let i = startDay; i < lastDay; i++) {
  //             let currentDay = `${startMonth}-${i.toString().padStart('0')}`
  //             allDays[currentDay][UnCompletedKey].push(item)
  //           }
  //           allDays[`${startMonth}-${lastDay.toString().padStart('0')}`][onlyOneMonth ? CompletedKey : UnCompletedKey].push(item)
  //         }
  //       } else {
  //         // 未完成
  //         if (startDate === endDate) {
  //           allDays[startDate][UnCompletedKey].push(item)
  //         } else {
  //           const lastDay = startMonth === endMonth ? endDay : monthDayCount
  //           for (let i = startDay; i <= lastDay; i++) {
  //             let currentDay = `${startMonth}-${i.toString().padStart('0')}`
  //             allDays[currentDay][UnCompletedKey].push(item)
  //           }
  //         }
  //       }
  //     })
  //     res.send(allDays)
  //   })
}

