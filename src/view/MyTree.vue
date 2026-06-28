<script setup lang="ts">
import {computed} from "vue";
import type {Permission} from "./RoleInfo.vue";

const props = defineProps({
  item:{
    type:Object,
    required:true
  }
})
const typeName2Chinese=computed(()=>{
  switch (props.item.menuType){
    case "DIRECTORY": return'目录';
    case "MENU": return'菜单';
    case "BUTTON": return'按钮';
    default: return '未知';
  }

})
const typeClass = computed(()=>{
  return `type-${props.item.menuType.toLowerCase()}`
})

const emit= defineEmits(['node-change'])

const handleChange=(e:Event)=>{

  // 1. 将 e.target 断言为 HTMLInputElement 类型
  const target = e.target as HTMLInputElement;
  //知道自己勾选的是谁
  // console.log("事件对象",e.target.checked);
  console.log("点击的是",props.item)
  emit('node-change',props.item,target?.checked);//事件的元素，状态传递给父组件
}

//处理子权限
const handleChildChange=(node:Permission,isChecked:boolean)=>{
  emit('node-change',node,isChecked);
}

</script>

<template>
  <div class="menu-content">
    <input type="checkbox"
           :checked="item.checked"
           @change="handleChange">
    <span class="item-name">{{props.item.name}}</span>
    <span class="item-menuType" :class="typeClass">{{typeName2Chinese}}</span>

    <div class="children" v-if="item.children && item.children.length>0">
      <MyTree v-for="subItem in item.children"
              :key="subItem.id" :item="subItem" @node-change="handleChildChange"/>
    </div>
  </div>
</template>

<style scoped>
.menu-content{
  margin-bottom: 5px;
}

.menu-content .children{
  margin-top: 5px;
}

.children{
  padding-left: 20px;
}

.item-menuType{
  float: right;
}
.type-directory{
  color: #569EFA;
  background-color: #EEF5FE;
}
.type-menu{
  color: #7ABF4A;
  background-color: #F2F9EC;
}
.type-button{
  color: pink;
  background-color: #FCF6ED;
}
</style>