'use strict';

function getDay(date){
  return `${date.getFullYear()}-${date.getUTCMonth()+1}-${date.getDate()}`;
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
      let bulkData = getDaysArray(
        new Date("2021-01-09"), 
        new Date("2021-04-09"), 
        1000
      ).map(o => {
        let engineers = randomInteger(1, 6);
        let observers = randomInteger(1, 4);
        let trainedLabor = randomInteger(1, 10);
        let labor = randomInteger(1, 15);
        return { 
          ...o, engineers, observers, trainedLabor, labor,
          createdAt: new Date(),
          updatedAt: new Date()
        } 
      });

      await queryInterface.bulkInsert('Workers', bulkData, {});
      
    }catch(err){
      console.log(err)
    }
  },

  down: async (queryInterface, Sequelize) => {
    try{
      return await queryInterface.bulkDelete('Workers', {projectId: 1000}, {});
    }catch(err){
      console.dir(err, {depth: null})
    }
  }
};
