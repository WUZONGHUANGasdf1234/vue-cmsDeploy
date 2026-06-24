

import axios from "@/http/axios .ts";

export interface RoleAuthorizePayload {
    roleId: number
    permissionIds: number[]
}

export interface Role {
    id: number;
    name: string;
}

export const authorizeRole = (data: RoleAuthorizePayload) => {
    return axios({
        url: '/api/role/authRole',
        method: 'POST',
        data
    })
}

export const getRoleList=()=>{
    return axios<Role[]>({
        url: '/api/role/roleList',
        method: 'GET',
    })
}

export const getAllPermission = ()=>{
    return axios({
        url: '/api/role/getAllPermission',
        method: 'GET',
    })
}

export const getPermissionOfCurrenRole=(roleId:number)=>{
    return axios({
        url: '/api/role/getPermissionOfCurrenRole',
        method: 'GET',
        params:{
            roleId
        }
    })
}


// 新增角色
export const addRole = (data: Role) => {
    return axios({
        url: '/api/role/addRole',
        method: 'POST',
        data
    })
}

// 编辑角色
export const updateRole = (data: Role) => {
    return axios({
        url: '/api/role/updateRole',
        method: 'PUT',
        data
    })
}

// 删除角色
export const deleteRole = (id: number) => {
    return axios({
        url: `/api/role/deleteRole/${id}`,
        method: 'DELETE',
    })
}


// export const saveRolePermission=(roleId:number,permissionId:number)=>{
//     return axios({
//         url: '/api/role/saveRolePermission',
//         method: 'POST',
//         params:{
//             roleId,
//             permissionId
//         }
//     })
// }

