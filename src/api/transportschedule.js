import request from "@/utils/request.js";

export  const resolveRequestService = (data) => {
    return request.post('transport-schedules/create',data)
}

export const NotPassService = (id) => {
    return request.post('transport-schedules/notPass',null,{params: {id:id}})
}

export const getTransportSchedule = (params) => {
    return request.get('/transport-schedules',{params:params})
}

export const sendCarService = (data) => {
    return request.post('transport-schedules/sendCar',data)
}

export const getScheduleForCollector= (params) => {
    return request.get('/transport-schedules/getForCollector',{params:params})
}