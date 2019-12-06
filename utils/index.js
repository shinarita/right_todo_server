const config = require('config');
const moment = require('moment');

const getMongoDbUrl = function () {
  const mongoData = config.get('mongo')
  let baseUrl = `mongodb://{username}:{password}@{host}:{port}/{database}?authSource=admin`
  const reg = /\{(\w)+\}/
  Object.keys(mongoData).forEach(key => {
    baseUrl = baseUrl.replace(reg, mongoData[key])
  })
  return baseUrl
}

const getAdministrator = function () {
  const administrator = config.get('administrator');
  return administrator
}

const DateFormat = 'YYYY-MM-DD'
/**
 * Get a array includes all days of one kind of Weekday specialed.
 *
 * @param {*} start:'yyyy-mm-dd'
 * @param {*} end:'yyyy-mm-dd'
 * @param {*} whichDay:[0-6],[Sunday-Saturday]
 */
const getWeekdayInRange = (start, end, whichDay) => {
  let dates = []
  const startDate = moment(start)
  const endDate = moment(end)
  let currentDate = startDate.clone().day(whichDay)
  let days = 7 + whichDay
  // 处理第一个指定日，有可能在开始日期之前
  if (currentDate.isBefore(startDate)) {
    currentDate.day(days)
  }
  while (currentDate.isSameOrBefore(endDate)) {
    dates.push(currentDate.format(DateFormat))
    currentDate.day(days)
  }
  return dates
}
const getWeekdaysInRange = (start, end, dayArr) => {
  let dates = []
  dayArr.forEach(day => {
    const data = getWeekdayInRange(start, end, day)
    dates = [...dates, ...data]
  })
  return dates
}

const getSpecialDatesInRange = (start, end, dateArr) => {
  let dates = []
  const startDate = moment(start)
  const startYear = startDate.year()
  const startMonth = startDate.month()
  const endDate = moment(end)
  const durationInMonth = Math.ceil(endDate.diff(startDate, 'months', true))
  let addedMonth = 0
  while (addedMonth <= durationInMonth) {
    dateArr.forEach(item => {
      const date = moment(new Date(startYear, startMonth + addedMonth, item))
      if (date.isValid() && date.isSameOrBefore(endDate) && date.isSameOrAfter(startDate)) {
        dates.push(date.format(DateFormat))
      }
    })
    addedMonth++
  }
  return [...new Set(dates)]
}

const getDaysInRange = (start, end) => {
  let dates = []
  const startDate = moment(start)
  const endDate = moment(end)
  // const durationInDay = endDate.diff(startDate, 'days')
  while (startDate.isSameOrBefore(endDate)) {
    dates.push(startDate.format(DateFormat))
    startDate.add(1, 'd')
  }
  return dates
}

module.exports = {
  getMongoDbUrl,
  getWeekdaysInRange,
  getSpecialDatesInRange,
  getDaysInRange,
  getAdministrator
}