import request from "@/utils/request.js";
export const saveMessage = (data) => {
    return request.post("/sendChatMessage", data)
}

export const getMessage = (params) => {
    return request.get('/getChatMessage', {params:params})
}


export const getRelationListService = () => {
    return request.get('/getMyRelationship')
}

export const addRelationService = (username) => {
    return request.post('/addToMyRelationship',null ,{params: {username: username}})
}

export  const toggleLongTermContactService = (prams) => {
    return request.post('/toggleLongTermContact',null ,{params: prams})
}



