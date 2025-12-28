import api from './axios';

export const getTodolist =(params:{uID:number})=>{
    return api.post('/todolist/getTodolist',params).then(res=>res.data.data.info);
}

export const saveSelectTask =(params:any)=>{
    return api.post('/todolist/saveSelectTask',params).then(res=>res.data);
}