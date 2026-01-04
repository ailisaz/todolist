import api from './axios';

export const getTodolist = async(params:{uID:number, selectTime:string })=>{
    return api.post('/todolist/getTodolist',params).then(res=>res.data.data.info);
}

export const saveSelectTask = async(activeTask:object|null)=>{
    return api.post('/todolist/saveSelectTask',activeTask).then(res=>res.data);
}

export const deleteSelectTask = async(params:{todoID:number})=>{
    return api.post('/todolist/deleteSelectTask',params).then(res=>res.data);
}

interface DateDisplayResponse {
    success: boolean;
    data: DateDisplayItem[];
}
interface DateDisplayItem{
		setup_date: string,
		SUM_real_num: number,
		SUM_pre_num: number
	}
export const getDateDisplay = async(params:{uID:number}):Promise<DateDisplayResponse>=>{
    return api.post('/todolist/getDateDisplay',params).then(res=>res.data);
}