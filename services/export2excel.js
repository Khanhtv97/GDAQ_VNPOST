const excel = require('node-excel-export');
function excelE(dataTB, res){
    const heading = [
        [{value: 'Thoi gian'},{value: 'Buu Ta'}, {value: 'b1'}, {value: 'c1'}, {value: 'd1'}, {value: 'e1'}, {value: 'f1'}, {value: 'g1'}, {value: 'h1'}, {value: 'i1'}, {value: 'j1'}, {value: 'k1'}, {value: 'l1'}, {value: 'm1'}, {value: 'n1'}, {value: 'o1'}, {value: 'p1'}, {value: 'q1'}],
        ['Thoi gian', 'Buu Ta', 'Ma buu kien', 'Khoi luong', 'Quy doi', 'Tinh cuoc', 'Chenh lech', 'Ty le', 'Dai', 'Rong', 'Cao', 'Khoi Luong(VNP)', 'Quy Doi(VNP)', 'Tinh Cuoc(VNP)', 'Dai(VNP)', 'Rong(VNP)', 'Cao(VNP)'] // <-- It can be only values
      ];
      const specification = { 
        created_at:{width:100},
        user:{width:100},
        barcode: { width:150 },
        massweight: {width: 100},
        calweight: {width: 100},
        priceweight: {width: 100},
        diffweight: {width: 100 },
        rate: {width: 100},
        length: {width: 100 },
        width: {width: 100},
        height: {width: 100},
        massweightVNP: {width: 100},
        calweightVNP: {width: 100 },
        priceweightVNP: {width: 100 },
        lengthVNP: {width: 100 },
        widthVNP: {width: 100 },
        lengthVNP: {width: 100 },
        heightVNP: {width: 100 }
      }
      const report = excel.buildExport(
        [ {
            name: 'Report',
            specification: specification, 
            heading: heading,
            data: dataTB 
          }]);
      // You can then return this straight
      res.attachment('Report'+Date.now()+'.xlsx'); // This is sails.js specific (in general you need to set headers)
      return res.send(report);
}
module.exports.exportExcel = excelE;