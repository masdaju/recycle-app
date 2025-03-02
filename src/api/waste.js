import request from "@/utils/request.js";

export const getWastePage = (params) => {
    return request.get(`/waste`, {params:params})
}
export const getWasteType = (params) => {
    return request.get(`/waste-classify`, {params:params})
}
export const createWasteTypeService = (data) => {
    return request.post(`/waste-classify/create`, data)
}
export const delWasteTypeService = (data) => {
    return request.post(`/waste-classify/delete`, data)
}
export const addWasteRequestService = (data) => {
    return request.post(`/waste-requests/create`, data)
}
export const MyWasteRequestService = (params) => {
    return request.get(`/waste-requests/getMyRequest`, {params:params})
}
export const deleteWasteRequestService = (data) => {
        return request.post(`/waste-requests/deleteByIds`, data)
}

export const  delWasteByIdsService = (data) => {
    return request.post(`/waste/deleteByIds`, data)
}
export const updateWasteRequestService = (data) => {
    return request.post(`/waste-requests/update`, data)
}

export const updateWasteService = (formData) => {
    return request.post(`/waste/update`, formData)
}
export const addWasteService = (formData) => {
    return request.post(`/waste/create`, formData)
}
export const getWasteRequestByStatus= (params) => {
    return request.get(`/waste-requests/getRequestByStatus`, {params:params})
}

export  const checkQuantityService = (map,id) => {
    // const params = new URLSearchParams()
    // params.append('requestId', id)
    return request.post(`/request-waste/checkQuantity`, map, {params: {requestId: id}})

}
export const getRequestWasteById = (id) => {
    return request.get(`/request-waste`,{params: {requestId: id}})

}
