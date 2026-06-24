import axios from "@/http/axios .ts";

/** 用户实体 */
export interface User {
    id: number;
    username: string;
    roleName: string;
    createTime: string;
}

/** 新增 / 编辑用户 */
export interface UserSavePayload {
    id?: number;
    username: string;
    roleId: number;
    password?: string;
}

/** 获取用户列表 */
export const getUserList = () => {
    return axios<User[]>({
        url: "/api/user/list",
        method: "GET",
    });
};

/** 新增用户 */
export const addUser = (data: UserSavePayload) => {
    return axios({
        url: "/api/user/add",
        method: "POST",
        data,
    });
};

/** 更新用户 */
export const updateUser = (data: UserSavePayload) => {
    return axios({
        url: "/api/user/update",
        method: "PUT",
        data,
    });
};

/** 删除用户 */
export const deleteUser = (userId: number) => {
    return axios({
        url: "/api/user/delete",
        method: "DELETE",
        params: { userId },
    });
};