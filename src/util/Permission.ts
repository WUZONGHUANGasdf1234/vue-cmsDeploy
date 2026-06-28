import { useUserStore } from '@/stores/user.ts'

export function hasPermission(code: string) {
    const userStore = useUserStore();
    // 这里的 permissions 是我们在 pinia 里定义的 computed，它是 string[] 类型
    return userStore.permissions.includes(code);
}

/**
 * 是否拥有某个权限
 */
export function hasPerm(perm: string): boolean {
    const userStore = useUserStore()
    return userStore.permissions.includes(perm)
}

/**
 * 是否拥有任意一个权限
 */
export function hasAnyPerm(perms: string[]): boolean {
    const userStore = useUserStore()
    return perms.some(p => userStore.permissions.includes(p))
}