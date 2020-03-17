var socket = io.connect('http://192.168.0.231:3000'); //connect to server
        var user = document.getElementById('user').innerText;
        socket.emit('user', {us: user});
        socket.on('calibVal', function(data){
            document.getElementById('Calib').innerHTML = data.Val;
        });
        socket.on('barcode', function(data){
            document.getElementById('Barcode').innerHTML = data.barcode;
        });
        socket.on('weight', function(data){
            document.getElementById('massWeight').innerHTML = data.massweight;
            
            if(data.h1 != 'ST'){
                document.getElementById('massWeight').style.backgroundColor ="red";
                document.getElementById('msgScale').innerHTML = data.msg;
            }else{
                document.getElementById('massWeight').style.backgroundColor ="cornflowerblue";
                document.getElementById('msgScale').innerHTML = "";
            }
        })
        socket.on('u81', function(data) {
            document.getElementById('length').innerHTML = data.length;
            document.getElementById('width').innerHTML = data.width;
            document.getElementById('height').innerHTML = data.height; //calWeigh
            document.getElementById('calWeight').innerHTML = data.calculateWeight;
            document.getElementById('priceWeight').innerHTML = data.pWeight; //priceWeight
            if(data.msgH !=''){
                document.getElementById('msgSSH').innerHTML = data.msgH;
                document.getElementById('height').style.backgroundColor ="red";
            }
            else{
                document.getElementById('msgSSH').innerHTML = '';
                document.getElementById('height').style.backgroundColor ="cornflowerblue";
            }
            if(data.msgL !=''){
                document.getElementById('msgSSL').innerHTML = data.msgL;
                document.getElementById('length').style.backgroundColor ="red";
            }else{
                document.getElementById('msgSSL').innerHTML = '';
                document.getElementById('length').style.backgroundColor ="cornflowerblue";
            }
            if(data.msgW !=''){
                document.getElementById('msgSSW').innerHTML = data.msgW;
                document.getElementById('width').style.backgroundColor ="red";
            }else{
                document.getElementById('msgSSW').innerHTML = '';
                document.getElementById('width').style.backgroundColor ="cornflowerblue";
            }
            //console.log(data);
        });
        socket.on('picture', function(data){
            document.getElementById('ifr1').src = (data.picturePath.split("../public"))[1].toString();
            //console.log((data.picturePath.split("../public"))[1].toString());//,/imagesItem/20200306181315.jpg
        });
        socket.on('dataVNP', function(data){
            document.getElementById('vnpostWeigh').innerHTML = data.weight; //vnpostCal
            document.getElementById('vnpostCal').innerHTML = data.calweight; //priceweight vnpostPrice
            document.getElementById('vnpostPrice').innerHTML = data.priceweight; //vnpostLength
            document.getElementById('vnpostLength').innerHTML = data.length; //vnpostWidth
            document.getElementById('vnpostWidth').innerHTML = data.width; //vnpostHeight
            document.getElementById('vnpostHeight').innerHTML = data.height; //diffW diffWeigh
            document.getElementById('diffWeigh').innerHTML = data.diffW; //
            if(data.diffW >300){document.getElementById('diffWeigh').style.background ='red'; document.getElementById('rate').style.background ='red';}
            else{document.getElementById('diffWeigh').style.background ='gray';document.getElementById('rate').style.background ='gray';}
            document.getElementById('rate').innerHTML = data.Rate; //isAir
            if(data.isAir ==true){document.getElementById('spAirScK').innerHTML = "Đường Bay"}
            else if(data.isAir ==false){document.getElementById('spAirScK').innerHTML = "Đường Bộ"}
            else{document.getElementById('spAirScK').innerHTML = "---"}
        });
        //vnpostWeigh

function alertFunction(){ alert("Không để bất kì vật gì lên mặt bàn cân !")}