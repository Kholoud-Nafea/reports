'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try{
      await queryInterface.bulkInsert('Projects', [{
        id: 1000,
        name: "1 كالتكس",
        officialName: "إعادة تأهيل طريق كالتكس الحسوة",
        contractorName: "إرم ستار للتجارة والمقاولات العامة",
        ownerName: "مكتب الأشغال العامة والطرق - محافظة عدن",
        advisorName: "مكتب الأشغال",
        location: "كالتكس -مديرية المنصورة & مديرية البريقية  - محافظة عدن",
        contractValue: 150000,
        beneficiariesCount: 5137463,
        originalPeriod: 3,
        modifiedPeriod: 3,
        startDate: new Date("2021-01-09"),
        expirationDate: new Date("2021-04-09"),
        currentExpirationDate: new Date("2021-04-09"),
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }catch(err){
      console.log(err)
    }
  },

  down: async (queryInterface, Sequelize) => {
    try{
      await queryInterface.bulkDelete('Projects', {id: 1000}, {});
    }catch(err){
      console.log(err)
    }
  }
};
