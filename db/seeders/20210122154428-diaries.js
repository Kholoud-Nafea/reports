'use strict';

function getDay(date){
  return `${date.getFullYear()}-${date.getUTCMonth()+1}-${date.getDate()}`;
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPercentage(min, max) {
  return +((Math.floor(Math.random() * (max - min + 1)) + min)/100).toFixed(1);
}


function getDaysArray(start, end, id) {
  let arr = [];
  // the following line adds a day to the end to fix -1 day result
  end.setDate(end.getDate()+1) 
  for(
    start; 
    end >= start; 
    start.setDate(start.getDate()+1)
  ){
    arr.push({projectId: id, workDay: getDay(start)})
  }
  return arr;
};


module.exports = {
  up: async (queryInterface, Sequelize) => {
    try{

      let options = ["منتظم", "متأخر","لم يقدم"]
      let planned  = 54.45;
      let achieved = 32.34;
      let certified = 23.67;

      let bulkData = getDaysArray(
        new Date("2021-01-09"), 
        new Date("2021-04-09"), 
        1000
      ).map(o => {
        planned = +(planned + randomPercentage(10, 99)).toFixed(1);
        achieved = +(achieved + randomPercentage(10, 99)).toFixed(1);
        certified = +(certified + randomPercentage(10, 99)).toFixed(1);

        let businessValue = randomInteger(1235, 123456);
        let updatingStatus = options[randomInteger(0, 2)];
      
        return { 
          ...o, planned, achieved, certified, businessValue, updatingStatus,
          createdAt: new Date(),
          updatedAt: new Date()
        } 
      });

      await queryInterface.bulkInsert('Diaries', bulkData, {});
      
    }catch(err){
      console.log(err)
    }
  },

  down: async (queryInterface, Sequelize) => {
    try{
      return await queryInterface.bulkDelete('Diaries', {projectId: 1000}, {});
    }catch(err){
      console.dir(err, {depth: null})
    }
  }
};
