<script setup lang="ts">

import '@wangeditor/editor/dist/css/style.css'
import {onBeforeUnmount, ref, shallowRef, watch} from 'vue'
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'
import {saveNews, saveNews as save, updateNews} from "@/http/news.ts";
import type { IDomEditor } from '@wangeditor/editor';


// ✅ 定义 Props：接收编辑的新闻数据
const props = defineProps<{
  news?: {
    id?: number
    title: string
    category: number
    content: string
  } | null
}>()

// ✅ 定义事件：保存成功后通知父组件
const emit = defineEmits(['save-success'])



// const editorRef = shallowRef()
const editorRef = ref<IDomEditor | null>(null);
const toolbarConfig = {}
// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
const mode = ref("default")
// 内容 HTML（提交给后端使用）
const valueHtml = ref()

const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

const editorConfig = {
  placeholder: '请输入内容......',
  MENU_CONF: {
    uploadImage: {}
  }
}

editorConfig.MENU_CONF['uploadImage'] = {

  server: 'http://localhost:9000/api/news/uploadImg',
  // form-data fieldName ，默认值 'wangeditor-uploaded-image'
  fieldName: 'wangeditor-uploaded-image',

  // 单个文件的最大体积限制，默认为 2M
  maxFileSize: 5 * 1024 * 1024, // 1M

  // 最多可上传几个文件，默认为 100
  maxNumberOfFiles: 5,

  // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
  allowedFileTypes: ['image/*'],

  // 超时时间，默认为 10 秒
  timeout: 5 * 1000, // 5 秒
}



const newsType = ref<number>(1);
const newsTitle = ref<string>("");

// ✅ 保存新闻
const saveNew = async () => {
  const baseNewsData = {
    title: newsTitle.value,
    category: newsType.value,
    content: valueHtml.value,
  }
  // 2. 判断是新增还是编辑
  if (props.news?.id) {
    // ✅ 编辑模式：手动创建一个包含 id 的新对象
    const newsData = {
      ...baseNewsData,      // 先展开基础数据
      id: Number(props.news.id)// 再单独加上 id
    };
    await updateNews(newsData);
  } else {
    // ✅ 新增模式：直接传递基础数据
    await saveNews(baseNewsData);
  }
  emit('save-success') // 通知父组件保存成功
}
// ✅ 初始化表单：如果是编辑模式，填充已有数据
watch(() => props.news, (newVal) => {
  if (newVal) {
    newsTitle.value = newVal.title
    newsType.value = newVal.category
    valueHtml.value = newVal.content
  } else {
    newsTitle.value = ''
    newsType.value = 1
    valueHtml.value = ''
  }
}, { immediate: true })

</script>

<template>
  <div>
    新闻标题：<input type="text" v-model="newsTitle">
    栏目：
    <select v-model="newsType">
      <option value=1>学院新闻</option>
      <option value=2>通知公告</option>
      <option value=3>学术活动</option>
      <option value=4>学工新闻</option>
    </select>
  </div>
  <div style="border: 1px solid #ccc;height: 600px;">
    <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
    />
    <Editor
        style="height: 500px;"
        v-model="valueHtml"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
    />
  </div>
  <div>
    <button @click="saveNew">保存新闻</button>
  </div>
</template>

<style scoped>

</style>