'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try{
      await queryInterface.bulkInsert('Terms', [
        {
          projectId: 1000, name: "الأعمال البيئية", value: 68841, percentage: 1.34,      
          createdAt: new Date(), updatedAt: new Date()
        },
        {
          projectId: 1000, name: "أعمال الرصف الإسفلتي", value: 4622688, percentage: 89.98,      
          createdAt: new Date(), updatedAt: new Date()
        },
        {
          projectId: 1000, name: "أعمال الأرصفة الخرسانية", value: 329825, percentage: 6.42,      
          createdAt: new Date(), updatedAt: new Date()
        },
        {
          projectId: 1000, name: "أعمال السلامة المرورية", value: 101208, percentage: 1.97,      
          createdAt: new Date(), updatedAt: new Date()
        },
        {
          projectId: 1000, name: "الأعمال الإنشائية", value: 0, percentage: 0,      
          createdAt: new Date(), updatedAt: new Date()
        },
        {
          projectId: 1000, name: "لوحة المشروع", value: 14898, percentage: 0.29,      
          createdAt: new Date(), updatedAt: new Date()
        }
      ], {});
    }catch(err){
      console.log(err)
    }
  },

  down: async (queryInterface, Sequelize) => {
    try{
      await queryInterface.bulkDelete('Terms', {id: 1000}, {});
    }catch(err){
      console.log(err)
    }
  }
};
