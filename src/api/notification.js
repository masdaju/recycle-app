import request from "@/utils/request.js";
export const setNotification = (data) => {
    const params = new URLSearchParams();
    for(let key in data){
        params.append(key,data[key])
    }
    return request.post("/notifications/setNotification", params)
}

export const getMyMsgService = (params) => {
    return request.get("/notifications/MyMsg",{params:params})
}

export const delMsgService = (data) => {
        return request.post("/notifications/deleteByIds",data)
}