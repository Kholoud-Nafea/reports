'use strict';

function randomPercentage(min, max) {
  return +((Math.floor(Math.random() * (max - min + 1)) + min)/100).toFixed(1);
}

function getDay(date){
  return `${date.getFullYear()}-${date.getUTCMonth()+1}-${date.getDate()}`;
}

function getMonthsArray(start, end){
  let arr = [];
  // the following line adds a day to the end to fix -1 day result
  end.setMonth(end.getMonth()+1) 
  for(
    start; 
    end >= start; 
    start.setMonth(start.getMonth()+1)
  ){
    let month = getDay(start);
    arr.push(
      {month, type: "planned"},
      {month, type: "achieved"},
      {month, type: "certified"}
    )
  }
  return arr;
};


module.exports = {
  
  up: async (queryInterface, Sequelize) => {
    try{
      const termsData = await queryInterface.sequelize.query(
        `SELECT * FROM Terms WHERE projectId = 1000`
      );
      const months = getMonthsArray(
        new Date("2021-01-09"), 
        new Date("2021-04-09")
      );
      let bulkData = [];
      termsData[0].map(d => {
        bulkData =  [...bulkData, ...months.map(b => {
          let value = +randomPercentage(1000, 9999).toFixed(1)
          return {
            ...b, projectId: 1000, termId: d.id, value, 
            createdAt: new Date(),
            updatedAt: new Date()  
          }
        })]
      })
      await queryInterface.bulkInsert('Termlies', bulkData, {})

    }catch(err){
      console.log(err)
    }
  },
    
  down: async (queryInterface, Sequelize) => {
    try{
      return await queryInterface.bulkDelete('Termlies', {projectId: 1000}, {});
    }catch(err){
      console.dir(err, {depth: null})
    }
  }
};
