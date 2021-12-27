var sd=require('silly-datetime');
module.exports={
    formatTime(params){
        if(params){
            return  sd.format(params,'YYYY-MM-DD HH:mm');

        }else{
            return "";
        }
    },
    formatTime2(params){
        return  sd.format(params,'YYYY-MM-DD');
    },
    formatTime3(params){
        return  sd.format(params,'YYYY年MM月DD日');
    }
}