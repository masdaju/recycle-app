import request from "@/utils/request.js";

export const getReport = (params) => {
    return request.get("/report", { params :params})
}


export const createReport = (data) => {
    return request.post("/reports/create", data)
}

export const deleteReport = (ids) => {
    return request.post("/report", ids)
}


