import request from "@/utils/request.js";

export const getStatistic = () => {
    return request.get("/statistic/totalByType")
}

export const getAllStatistic = () => {
    return request.get(`/statistic/total`)
}

export const getStatisticByMonth = (year) => {
    return request.get(`/statistic/totalByMonth`,{params:{year:year}})
}

export const getMessByType = () => {
    return request.get(`/statistic/getMessByType`)
}