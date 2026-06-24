<script setup lang="ts">
import {onMounted, ref} from "vue";
import {
  addRole,
  authorizeRole, deleteRole,
  getAllPermission,
  getPermissionOfCurrenRole,
  getRoleList,
  type Role,
  type RoleAuthorizePayload, updateRole
} from "@/http/role.ts";
import MyTree from "@/view/MyTree.vue";



const roleList = ref<Role[]>([]);
const allPermission=ref<Permission[]>([]);

// 新增：控制新增/编辑弹窗
const showEditDialog = ref(false);
const editRoleData = ref<Role>({id:0, name: '' });
const isEditMode = ref(false); // true:编辑模式, false:新增模式



export interface Permission{
  id:number
  name:string
  menuType:string
  checked:boolean
  children:Permission[]
  halfChecked:boolean
  menuGranted:boolean
}

onMounted(async()=>{
  roleList.value = await getRoleList();
  console.log("所有角色",roleList.value);
})


// 打开新增角色弹窗
const openAddDialog = () => {
  isEditMode.value = false;
  editRoleData.value = { id:0,name: '' };
  showEditDialog.value = true;
};

// 打开编辑角色弹窗
const openEditDialog = (role: Role) => {
  isEditMode.value = true;
  editRoleData.value = { ...role };
  showEditDialog.value = true;
};

// 保存角色（新增或编辑）
const saveRole = async () => {
  try {
    if (isEditMode.value) {
      await updateRole(editRoleData.value);
      alert("更新成功！");
    } else {
      await addRole(editRoleData.value);
      alert("新增成功！");
    }
    showEditDialog.value = false;
    // 刷新角色列表
    roleList.value = await getRoleList();
  } catch (error) {
    console.error("保存失败:", error);
    alert("保存失败，请重试");
  }
};

// 删除角色
const handleDeleteRole = async (id: number) => {
  if (confirm("确定要删除这个角色吗？")) {
    try {
      await deleteRole(id);
      alert("删除成功！");
      // 刷新角色列表
      roleList.value = await getRoleList();
    } catch (error) {
      console.error("删除失败:", error);
      alert("删除失败，请重试");
    }
  }
};



const currentRoleId = ref<number | null>(null); // 新增：存储当前正在授权的角色ID
// 打开遮罩层
const openAuthDialog = async(roleId:number) => {

  currentRoleId.value = roleId;//记录当前打开的角色id；
  //拿到已有权限
  const  rolePermissionIds = await getPermissionOfCurrenRole(roleId);
  console.log("已有权限",rolePermissionIds);
  //获取所有权限
  allPermission.value = await getAllPermission();
  console.log("全部权限",allPermission.value);
  //调用递归函数初始化
  initMenuState(allPermission.value)
  //这里全打勾，不管半选这些
  checkExistingPermissions(allPermission.value,rolePermissionIds)
  //实现半选
  calculateParentStatus(allPermission.value)




  //点击授权显示对话框
  isHide.value=false;
}
//计算父节点状态
// const calculateParentStatus=(allPermission:Permission[])=>{
//   allPermission.forEach(node=>{
//     if(node.children && node.children.length>0){
//       calculateParentStatus(node.children);
//       let allChecked = true;//
//       let hasChecked = false;//假设children全选
//       node.children.forEach(child=>{
//         //只要一个子节点没有选中， allChecked = false;父元素不全选
//         if(!child.checked){
//           allChecked = false;
//         }
//         if(child.checked || child.halfChecked){
//           hasChecked = true;
//         }
//       })
//       if(allChecked){
//         node.checked=true;
//         node.halfChecked=false;
//       }else if(hasChecked){
//         node.checked=false;
//         node.halfChecked=true;
//       }else {
//         if(node.menuGranted){
//           node.checked=false;
//           node.halfChecked=true;
//         }else {
//           node.checked=false;
//           node.halfChecked=false;
//         }
//
//       }
//     }
//   })
// }

//计算父组件的状态（实现全选或半选）
const calculateParentStatus = (allPermission: Permission[]) => {
  allPermission.forEach(node => {
    // 采用后序遍历，先从最底层的 children 开始计算
    if (node.children && node.children.length > 0) {
      calculateParentStatus(node.children);
      // 1. 使用 every 检查是否【全选】：必须所有子节点的 checked 都为 true
      let allChecked = node.children.every(child => child.checked);
      // 2. 使用 some 检查是否【有勾选】：只要有一个子节点被勾选(checked) 或 处于半选(halfChecked)
      let hasChecked = node.children.some(child => child.checked || child.halfChecked);
      node.checked = allChecked;
      node.halfChecked = !allChecked && hasChecked;
      if (!allChecked && !hasChecked && node.menuGranted) {
        node.checked = false;
        node.halfChecked = true;
      }
    }
  });
};

//已有权限打勾
const checkExistingPermissions = (allPermission:Permission[],rolePermissionIds:number[])=>{
  // console.log("角色权限",rolePermissionIds);
  allPermission.forEach(item=>{
    if(rolePermissionIds.includes(item.id)){
      item.checked = true;
      item.menuGranted=true;
    }
    //判断item是否有子权限，递归打勾
    if(item.children && item.children.length>0){
      checkExistingPermissions(item.children,rolePermissionIds);
    }

  })
}

const initMenuState = (treeData:Permission[]) => {
  treeData.forEach(menu => {
    menu.checked=false;
    menu.halfChecked=false;
    menu.menuGranted=false;
    //menu.checked = true;//给menu加checked属性，用于判断打勾状态
    if (menu.children) {
      initMenuState(menu.children);//递归
    }
  });
};

//接受子组件传来的数据，更新子节点的状态（打勾与否），把父节点状态修改
const onNodeChange=(node:Permission,isChecked:boolean)=>{
  console.log("子节点传的数据",node,isChecked);
  //更新子节点的状态（打勾与否）
  updateChildState(node,isChecked);
  //根据子节点的状态（打勾与否），把父节点状态修改
  calculateParentStatus(allPermission.value);
}
const updateChildState=(node:Permission,isChecked:boolean)=>{
  node.checked = isChecked;
  node.halfChecked = false;

  if(!isChecked){
    node.menuGranted=false;
  }

  if(node.children && node.children.length>0){
    node.children.forEach(child=>{
      updateChildState(child,isChecked);
    })
  }
}

//添加权限进数据库
// 收集所有选中的权限ID
const collectCheckedPermissionIds = (permissions: Permission[]): number[] => {
  const ids: number[] = [];
  const traverse = (nodes: Permission[]) => {
    nodes.forEach(node => {
      if (node.checked) {
        ids.push(node.id);
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  traverse(permissions);
  return ids;
};

// 保存角色权限
const saveRolePermission = async () => {
  if (!currentRoleId.value) {
    console.error("没有选择角色");
    return;
  }

  // 收集所有选中的权限ID
  const permissionIds = collectCheckedPermissionIds(allPermission.value);

  console.log("保存权限:", {
    roleId: currentRoleId.value,
    permissionIds
  });

  try {
    // 调用授权API
    const data: RoleAuthorizePayload = {
      roleId: currentRoleId.value,
      permissionIds
    };

    await authorizeRole(data);
    alert("授权成功！");
    isHide.value = true; // 关闭对话框
  } catch (error) {
    console.error("授权失败:", error);
    alert("授权失败，请重试");
  }
};



//关闭遮罩
const closeAuthDialog = (e:any) => {

  // if(e.target.id=='closeModal'||e.target.id=='rbacModal'){
  //   // console.log("事件对象",e.target);
  //   isHide.value=true;
  // }
  isHide.value=true;
  console.log("最外层");

}

const isHide=ref(true);//值为true关闭遮罩层



</script>

<template>
  <!-- 新增角色按钮 -->
  <button @click="openAddDialog" style="margin-bottom: 10px;">新增角色</button>
  <table>
    <tr>
      <th>角色Id</th>
      <th>角色名称</th>
      <th>操作</th>
    </tr>
    <tr v-for="role in roleList" :key="role.id">
      <td>{{role.id}}</td>
      <td>{{role.name}}</td>
      <td>
        <button @click="openAuthDialog(role.id)">授权</button>
        <button @click="openEditDialog(role)">编辑</button>
        <button @click="handleDeleteRole(role.id)">删除</button>
      </td>
    </tr>
  </table>

  <!-- 新增/编辑角色弹窗 -->
  <div v-if="showEditDialog" class="rbac-modal-overlay" @click.self="showEditDialog = false">
    <div class="rbac-modal-content" style="width: 400px; height: auto;">
      <span class="rbac-modal-close" @click="showEditDialog = false">&times;</span>
      <div style="padding: 20px;">
        <h2>{{ isEditMode ? '编辑角色' : '新增角色' }}</h2>
        <div style="margin: 20px 0;">
          <label>角色名称：</label>
          <input
              v-model="editRoleData.name"
              type="text"
              placeholder="请输入角色名称"
              style="width: 200px; padding: 5px;"
          />
        </div>
        <div style="text-align: right; margin-top: 20px;">
          <button @click="saveRole" style="margin-right: 10px;">保存</button>
          <button @click="showEditDialog = false">取消</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 遮罩层（初始隐藏） -->
  <div id="rbacModal" class="rbac-modal-overlay" :class="{modelHide:isHide}" @click.self="closeAuthDialog($event)">
    <div class="rbac-modal-content" id="modalContent">
      <span class="rbac-modal-close" id="closeModal" @click="closeAuthDialog">&times;</span>
      <!-- 这里放你的表单组件或内容 -->
      <!--      <div style="padding: 20px; height: 100%; box-sizing: border-box;" @click.stop>-->
      <div style="padding: 20px; height: 100%; box-sizing: border-box;">
        <h2>角色授权</h2>
        <MyTree v-for="menu in allPermission"
                :key = "menu.id"
                :item="menu"
                @node-change="onNodeChange">
        </MyTree>
        <button class="save" @click="saveRolePermission">保存</button>
      </div>
    </div>
  </div>

</template>

<style scoped>
table,tr,th,td{
  border: 1px solid black;
  border-collapse: collapse;
}

/* 遮罩层容器 */
.rbac-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* 遮罩内容区 */
.rbac-modal-content {
  width: 640px;
  height: 600px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

/* 关闭按钮示例（可选） */
.rbac-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
  font-size: 20px;
  color: #999;
}


.modelHide{
  display: none;
}
.save{
  float: right;
}


</style>
