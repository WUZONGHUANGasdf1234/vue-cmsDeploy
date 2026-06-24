<script setup lang="ts">
import {onMounted, ref} from "vue";
import {deleteNews, newsList, updateNewsStatus} from "@/http/news.ts";
import PublishNews from "@/view/PublishNews.vue";

export interface News{
  id:number;
  title:string;
  status:string;
  content:string;
}
const newsListData = ref<News[]>([]);
const stripHtml = (html: string) => {
  return html
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
}
const totalNum =ref();
const updateNewsContent = (newsListData: News[])  =>{
  newsListData.forEach(news => {
    news.content = stripHtml(news.content);
    if(news.content.length > 60) {
      news.content = news.content.substring(0,60).concat("......");
    }
  })
}
//钩子函数是一个异步函数（调用完马上返回，但是此时数据还没返回回来，就有可能造成数据无法渲染）
// onMounted(async()=>{
//   let {total,totalPage,data} =await newsList(currentPage.value,2);
//   totalNum.value = totalPage;
//   newsListData.value = data;
//   updateNewsContent(newsListData.value);
// })

// ✅ 遮罩层状态
const showModal = ref(false)
const editingNews = ref<News | null>(null)

// ✅ 打开新增
const openAddModal = () => {
  editingNews.value = null
  showModal.value = true
}

// ✅ 打开编辑
const openEditModal = (news: News) => {
  editingNews.value = news
  showModal.value = true
}

// ✅ 关闭遮罩层并刷新列表
const closeModal = async () => {
  showModal.value = false
  await loadNewsList()
}

// ✅ 加载列表
const loadNewsList = async () => {
  const { total, totalPage, data } = await newsList(currentPage.value, 2)
  totalNum.value = totalPage
  newsListData.value = data.map(news => ({
    ...news,
    content: stripHtml(news.content).slice(0, 60) + '...'
  }))
}

const handleDelete = async (id: number) => {
  const ok = window.confirm("确定要删除这条新闻吗？删除后不可恢复！");
  if (!ok) return;

  try {
    const response = await deleteNews(id);
    console.log(response);

    // ✅ 根据后端返回结果显示不同弹窗
    if (response == "删除成功") {
      alert("✅ 删除成功！");
      await loadNewsList();
    } else {
      alert("❌ 删除失败：" + response.data);
    }
  } catch (error) {
    // ✅ 错误处理
    console.error("删除失败:", error);
  }
};

onMounted(loadNewsList)

const currentPage=ref(1);
const prev=async()=>{
  currentPage.value--;
  if(currentPage.value ==0) {
    currentPage.value=1;
  }
  let {total,totalPage,data} =await newsList(currentPage.value,2);
  newsListData.value = data;
  updateNewsContent(newsListData.value);

}
const next=async()=>{
  currentPage.value++;
  let {total,totalPage,data} =await newsList(currentPage.value,2);
  newsListData.value = data;
  updateNewsContent(newsListData.value);
}
const first=async()=>{
  currentPage.value=1;
  let {total,totalPage,data} =await newsList(currentPage.value,2);
  newsListData.value = data;
  updateNewsContent(newsListData.value);
}
const later=async()=>{
  currentPage.value=totalNum.value;
  let {total,totalPage,data} =await newsList(currentPage.value,2);
  newsListData.value = data;
  updateNewsContent(newsListData.value);
}

// ✅ 预览相关状态
const showPreviewModal = ref(false)
const previewNews = ref<News | null>(null)

// ✅ 打开预览
const openPreview = (news: News) => {
  previewNews.value = news
  showPreviewModal.value = true
}

// ✅ 关闭预览
const closePreview = () => {
  showPreviewModal.value = false
  previewNews.value = null
}

// ✅ 审核通过
const handleApprove = async (id: number) => {
  if (!window.confirm("确定要通过这条新闻吗？")) return

  try {
    await updateNewsStatus(id, "已通过")
    alert("✅ 审核通过")
    await loadNewsList()
  } catch (error) {
    alert("❌ 操作失败")
  }
}

// ✅ 审核驳回
const handleReject = async (id: number) => {
  if (!window.confirm("确定要驳回这条新闻吗？")) return

  try {
    await updateNewsStatus(id, "已驳回")
    alert("✅ 已驳回")
    await loadNewsList()
  } catch (error) {
    alert("❌ 操作失败")
  }
}


</script>

<template>
<div>
  <!-- ✅ 新增按钮 -->
  <button @click="openAddModal">新增新闻</button>
  <table>
    <tr >
      <th>新闻标题</th>
      <th>正文摘要</th>
      <th>状态</th>
      <th>操作</th>
      <th>审核</th>
    </tr>
    <tr v-for="news in newsListData" :key="news.id">
      <td>{{news.title}}</td>
      <td>{{news.content}}</td>
      <td>{{news.status}}</td>
      <td>
        <!-- ✅ 编辑按钮 -->
        <button @click="openEditModal(news)">编辑</button>
        <button @click="handleDelete(news.id)">删除</button>
      </td>
      <td>
        <button
            class="approve-btn"
            @click="handleApprove(news.id)"
            :disabled="news.status === '已通过'"
        >
          通过
        </button>
        <button
            class="reject-btn"
            @click="handleReject(news.id)"
            :disabled="news.status === '已驳回'"
        >
          驳回
        </button>
        <button
            class="preview-btn"
            @click="openPreview(news)"
        >
          预览
        </button>
      </td>
    </tr>
  </table>
  <div style="float:right; margin-right: 87px" >
    共{{totalNum}}页
    <button @click="first">首页</button>
    <button @click="prev" :disabled="currentPage===1">上一页</button>
    <button @click="next" :disabled="currentPage==totalNum">下一页</button>
    <button @click="later">尾页</button>
  </div>
</div>
  <!-- ✅ 遮罩层 -->
  <div v-if="showModal" class="modal-mask">
    <div class="modal-container">
      <button class="close-btn" @click="closeModal">×</button>
      <PublishNews
          :news="editingNews"
          @save-success="closeModal"
      />
    </div>
  </div>

  <!-- ✅ 预览遮罩层 -->
  <div v-if="showPreviewModal" class="modal-mask">
    <div class="modal-container preview-modal">
      <button class="close-btn" @click="closePreview">×</button>
      <div class="preview-content">
        <h2 class="preview-title">{{ previewNews?.title }}</h2>
        <div class="preview-body" v-html="previewNews?.content"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
table, tr, th, td {
  border: 1px solid black;
  border-collapse: collapse;
}

/* ✅ 遮罩层样式 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-container {
  background: white;
  width: 80%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 20px;
  border-radius: 8px;
  position: relative;
}

.close-btn {
  position: absolute;
  right: 15px;
  top: 10px;
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
}

/* ✅ 预览遮罩层样式 */
.preview-modal {
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
}

.preview-content {
  padding: 20px;
}

.preview-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.preview-body {
  line-height: 1.6;
  font-size: 16px;
}

.preview-body img {
  max-width: 100%;
  height: auto;
}

</style>