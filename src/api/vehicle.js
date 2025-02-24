import request from '@/utils/request'


export  const  getVehicleService = (params) => {
    return request.get('/vehicles', {params:params})
}

export const  delVehicleService = (ids) => {
    return request.post('/vehicles/delete', ids)
}

export const  addVehicleService = (data) => {
    return request.post('/vehicles/create', data)
}

export const  updateVehicleService = (data) => {
    return request.post('/vehicles/update', data)
}