import axios from "@/http/axios .ts";

// 权限接口定义
export interface Permission {
    id: number;
    name: string;
    menuType:string
    code: string;
    path: string | null;
    parentId: number;
    sort: number;
}

// 创建权限参数（不需要id）
export type CreatePermissionParams = Omit<Permission, 'id'>;

// 更新权限参数
export type UpdatePermissionParams = Partial<Permission>;

/**
 * 获取所有权限列表
 */
export const getAllPermission = () => {
    return axios<Permission[]>({
        url: '/api/permission/list',
        method: 'GET',
    });
};

/**
 * 根据ID获取单个权限
 */
export const getPermissionById = (id: number) => {
    return axios<Permission>({
        url: `/api/permission/${id}`,
        method: 'GET',
    });
};

/**
 * 创建新权限
 */
export const createPermission = (data: CreatePermissionParams) => {
    return axios({
        url: '/api/permission/create',
        method: 'POST',
        data,
    });
};

/**
 * 更新权限
 */
export const updatePermission = (id: number, data: UpdatePermissionParams) => {
    return axios({
        url: `/api/permission/update/${id}`,
        method: 'PUT',
        data,
    });
};

/**
 * 删除权限
 */
export const deletePermission = (id: number) => {
    return axios({
        url: `/api/permission/delete/${id}`,
        method: 'DELETE',
    });
};

/**
 * 获取权限树（用于角色授权时选择）
 */
export const getPermissionTree = () => {
    return axios<Permission[]>({
        url: '/api/permission/tree',
        method: 'GET',
    });
};