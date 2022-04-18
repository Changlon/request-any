type reqAny = (option:{
    route?:string,
    data?:{[k:string]:any},
    type?:string,
    json?:boolean,
    baseUrl?:string,
    timeout?:number,
    headers?:{[k:string]:any},
    cache?:boolean, 
    expire?:number
})=> Promise<any> 
export default function generateReqAny(reqUrl?:string):reqAny 






 


 
