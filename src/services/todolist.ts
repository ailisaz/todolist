import api from './axios';

export const getTodolist =(params:{uID:number})=>{
    return api.post('/todolist/getTodolist',params).then(res=>res.data.data.info);
}