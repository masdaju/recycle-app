import request from "@/utils/request.js";

//登录
export const login = (loginData)=>{
  const params = new URLSearchParams();
  for(let key in loginData){
    params.append(key,loginData[key])
  }
  return request.post('sys-user/login',params)
}
//退出
// export function logout() {
//   return request({
//     url: baseUrl + "/logout",
//     method: "get",
//   });
// }
export const deleteUserService = (id)=>{
  return request.post('sys-user/delete/'+id);
}
export const addUserService = (user)=>{
  return request.post('sys-user/create',user);
}
export const updatePasswordService = (params)=>{
  return request.post('sys-user/updatePassWord', null,{params: params});
}
export const updateUserService = (user)=>{
  return request.post('sys-user/update',user);
}
export const getUserById = (id)=>{
  return request.get('sys-user/'+id);
}

export function logout(id) {
  return request.get('sys-user/logout',{params: {uid: id}});
}
export const getUserListService = (params)=>{
  return request.get('/sys-user',{params: params});
}

export const uploadAvatarService = (formData)=>{
  return request.post('sys-user/uploadAvatar', formData);
}

export const getCollectorList = (params)=>{
  return request.get('sys-user/getCollectorList',{params:params});
}

export const fetchAmount = (uid)=>{
    return request.get('sys-user/fetchAmount',{params:{uid:uid}});
}
