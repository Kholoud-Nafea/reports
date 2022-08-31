'use strict';

function getDay(date){
  return `${date.getFullYear()}-${date.getUTCMonth()+1}-${date.getDate()}`;
}

function getMonthsArray(start, end) {
  let arr = [];
  // the following line fixes issues with date insertion .
  start.setDate(2); end.setDate(2);
  for(
    start; 
    end >= start; 
    start.setMonth(start.getMonth()+1)
  ){
    let month = getDay(start);
    arr.push({month})
  }
  return arr;
};

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPercentage(min, max) {
  return +((Math.floor(Math.random() * (max - min + 1)) + min)/100).toFixed(1);
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try{

      const options = ["منتظم", "متأخر","متأخر جداً", "متوقف"];
      const months = getMonthsArray(
        new Date("2021-01-09"), 
        new Date("2021-04-09")
      );

      let bulkData =  months.map(b => {        
        let plannedRatios = +randomPercentage(10, 99).toFixed(1);
        let achievedRatios = +randomPercentage(10, 99).toFixed(1);
        let certifiedRatios = +randomPercentage(10, 99).toFixed(1);
        let executedDeads = randomInteger(12345, 123456);
        let paidToContractor = randomInteger(0, 123456);
        let requestedOrders = randomInteger(0, 10);
        let certifiedOrders = randomInteger(0, 10);  
        
        return {
          ...b, projectId: 1000,
          plannedRatios, achievedRatios, certifiedRatios,
          executedDeads, paidToContractor, 
          requestedOrders, certifiedOrders,
          status: options[randomInteger(0, 3)],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      await queryInterface.bulkInsert('Monthlies', bulkData, {})

    }catch(err){
      console.log(err)
    }
  },
    
  down: async (queryInterface, Sequelize) => {
    try{
      return await queryInterface.bulkDelete('Monthlies', {projectId: 1000}, {});
    }catch(err){
      console.dir(err, {depth: null})
    }
  }
};
