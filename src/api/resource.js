import request from "@/utils/request.js";
export const getResourceTree = (params) => {
    return request.get('sys-resources/tree',{params:params})

}

export const getFullTreeService = () => {
    return request.get('sys-resources/fullTree')

}

export const deleteResourceService=(id)=>{
    return request.post('sys-resources/delete/'+id)
}

export const addResourceService=(data)=>{
    return request.post('sys-resources/create',data)
}
export const updateResourceService=(data)=>{
    return request.post('sys-resources/update',data)
}