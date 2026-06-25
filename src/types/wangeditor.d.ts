declare module '@wangeditor/editor-for-vue' {
    import type { DefineComponent } from 'vue'

    // 这里声明导出的组件
    export const Editor: DefineComponent<{}, {}, any>
    export const Toolbar: DefineComponent<{}, {}, any>
}