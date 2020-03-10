function CalP(barcode, IsAirmail, length, width, height){
    var serviceCode = barcode.substring(0,1);
    if((serviceCode== 'C'||serviceCode=='P'||serviceCode=='U') && IsAirmail==false){
        return ((length*width*height)/4000).toFixed(0);
    }
    else{
        return ((length*width*height)/6000).toFixed(0);
    }
  }
module.exports.Cal = CalP;