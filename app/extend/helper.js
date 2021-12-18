var sd=require('silly-datetime');
module.exports={
    formatTime(params){
        return  sd.format(params,'YYYY-MM-DD HH:mm');
    },
    formatTime2(params){
        return  sd.format(params,'YYYY-MM-DD');
    }
}