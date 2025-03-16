import request from '@/utils/request.js'


export const getFeedback = (params)=> {
    return request.get('/feedbacks',{params:params})
}

export const checkedFeedback = (feedbackId) => {
    return request.get('/feedbacks/checked',{params: {feedbackId:feedbackId}})
}
export const addFeedback = (data) => {
    return request.post('/feedbacks/create',data)
}

