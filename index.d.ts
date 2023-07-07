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

export default function generateReqAny(genOption : { 
    reqUrl:string ,
    beforeRequest ? : (data,headers)=> any ,
    afterResponse  ? : (data,headers)=> any , 
    timeout?:number ,
    debug ? :boolean,
}):reqAny 

 

 
