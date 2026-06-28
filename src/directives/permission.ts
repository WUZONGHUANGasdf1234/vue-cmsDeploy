
import {hasAnyPerm, hasPerm} from "@/util/Permission.ts";
import type {App} from "vue";


export default {
    install(app: App) {
        app.directive('permission', {
            mounted(el, binding) {
                const { value } = binding

                if (!value) return

                // 支持字符串或数组
                const has =
                    typeof value === 'string'
                        ? hasPerm(value)
                        : hasAnyPerm(value)

                if (!has) {
                    // ✅ 直接移除 DOM（比 display:none 更安全）
                    el.parentNode?.removeChild(el)
                }
            }
        })
    }
}