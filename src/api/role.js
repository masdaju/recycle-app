
import request from "@/utils/request.js";


export const getRoleList = (params) => {
    return request.get('/sys-role', {params: params})
 }
 export const addRoleService = (data) => {
    return request.post('/sys-role/create', data)
 }
 export const editRoleService = (data) => {
    return request.post('/sys-role/update', data)
 }

 export const deleteRoleService = (id) => {
    return request.post('/sys-role/delete/'+id)
 }