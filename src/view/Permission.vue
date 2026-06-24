<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  createPermission,
  deletePermission,
  getAllPermission,
  updatePermission,
  type Permission
} from "@/http/permission.ts";


// 权限列表数据
const permissionList = ref<Permission[]>([]);

// 控制编辑/新增弹窗显示
const isEditModalHide = ref(true);
const isAddModalHide = ref(true);

// 当前正在编辑的权限
const currentPermission = ref<Permission | null>(null);

// 新权限表单数据
const newPermission = ref<Partial<Permission>>({
  name: "",
  menuType: "MENU",
  code: "",
  path: "",
  parentId: 0,
  sort: 0
});

// 加载权限列表
// 加载权限列表
const loadPermissions = async () => {
  try {
    const list = await getAllPermission();

    // 定义排序权重：目录=1, 菜单=2, 按钮=3
    const typeWeight = (type: string) => {
      if (type === 'DIRECTORY') return 1;
      if (type === 'MENU') return 2;
      if (type === 'BUTTON') return 3;
      return 99; // 防止后端乱传数据导致排序出错
    };

    // 排序核心
    list.sort((a, b) => {
      const weightA = typeWeight(a.menuType);
      const weightB = typeWeight(b.menuType);

      // 1. 先按 目录 > 菜单 > 按钮 排
      if (weightA !== weightB) {
        return weightA - weightB;
      }

      // 2. 如果类型一样，按 ID 从小到大排
      return a.id - b.id;
    });

    permissionList.value = list;
    console.log("排序后的权限列表", permissionList.value);
  } catch (error) {
    console.error("加载权限失败", error);
    alert("加载权限失败");
  }

};

// 根据 parent_id 找父级权限名称
const getParentName = (parentId: number) => {
  if (!parentId || parentId === 0) return '顶级权限';

  const parent = permissionList.value.find(
      (item: Permission) => item.id === parentId
  );

  return parent ? parent.name : '顶级权限';
};


onMounted(() => {
  loadPermissions();
});

// 打开编辑弹窗
const openEditDialog = (permission: Permission) => {
  currentPermission.value = { ...permission };
  isEditModalHide.value = false;
};

// 打开新增弹窗
const openAddDialog = () => {
  newPermission.value = {
    name: "",
    menuType: "MENU",
    code: "",
    path: "",
    parentId: 0,
    sort: 0
  };
  isAddModalHide.value = false;
};

// 保存编辑
const saveEditPermission = async () => {
  if (!currentPermission.value) return;

  try {
    await updatePermission(currentPermission.value.id, currentPermission.value);
    alert("更新成功！");
    isEditModalHide.value = true;
    await loadPermissions(); // 刷新列表
  } catch (error) {
    console.error("更新失败", error);
    alert("更新失败，请重试");
  }
};

// 保存新增
const saveAddPermission = async () => {
  try {
    await createPermission(newPermission.value as Omit<Permission, "id">);
    alert("添加成功！");
    isAddModalHide.value = true;
    await loadPermissions(); // 刷新列表
  } catch (error) {
    console.error("添加失败", error);
    alert("添加失败，请重试");
  }
};

// 删除权限
const deletePermissionHandler = async (id: number) => {
  if (!confirm("确定要删除这个权限吗？")) return;

  try {
    await deletePermission(id);
    alert("删除成功！");
    await loadPermissions(); // 刷新列表
  } catch (error) {
    console.error("删除失败", error);
    alert("删除失败，请重试");
  }
};

// 关闭弹窗
const closeEditDialog = () => {
  isEditModalHide.value = true;
  currentPermission.value = null;
};

const closeAddDialog = () => {
  isAddModalHide.value = true;
};
</script>

<template>
  <div class="permission-container">
    <div class="header">
      <h2>权限管理</h2>
      <button class="add-btn" @click="openAddDialog">新增权限</button>
    </div>

    <!-- 权限列表表格 -->
    <table>
      <thead>
      <tr>
        <th>ID</th>
        <th>权限名称</th>
        <th>类型</th>
        <th>权限编码</th>
        <th>路由路径</th>
        <th>父级ID</th>
        <th>排序</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="permission in permissionList" :key="permission.id">
        <td>{{ permission.id }}</td>
        <td>{{ permission.name }}</td>
        <td>
            <span :class="`type-${permission.menuType}`">
              {{ permission.menuType }}
            </span>
        </td>
        <td>{{ permission.code }}</td>
        <td>{{ permission.path || '-' }}</td>
        <td>{{ getParentName(permission.parentId) }}</td>
        <td>{{ permission.sort }}</td>
        <td>
          <button class="edit-btn" @click="openEditDialog(permission)">编辑</button>
          <button class="delete-btn" @click="deletePermissionHandler(permission.id)">删除</button>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- 编辑权限弹窗 -->
    <div
        class="modal-overlay"
        :class="{ modelHide: isEditModalHide }"
        @click.self="closeEditDialog"
    >
      <div class="modal-content">
        <span class="modal-close" @click="closeEditDialog">&times;</span>
        <h3>编辑权限</h3>

        <div v-if="currentPermission" class="form-container">
          <div class="form-group">
            <label>权限名称:</label>
            <input v-model="currentPermission.name" type="text" />
          </div>

          <div class="form-group">
            <label>权限类型:</label>
            <select v-model="currentPermission.menuType">
              <option value="DIRECTORY">目录</option>
              <option value="MENU">菜单</option>
              <option value="BUTTON">按钮</option>
            </select>
          </div>

          <div class="form-group">
            <label>权限编码:</label>
            <input v-model="currentPermission.code" type="text" />
          </div>

          <div class="form-group">
            <label>路由路径:</label>
            <input v-model="currentPermission.path" type="text" />
          </div>

          <div class="form-group">
            <label>父级ID:</label>
            <input v-model.number="currentPermission.parentId" type="number" />
          </div>

          <div class="form-group">
            <label>排序:</label>
            <input v-model.number="currentPermission.sort" type="number" />
          </div>

          <div class="form-actions">
            <button class="save-btn" @click="saveEditPermission">保存</button>
            <button class="cancel-btn" @click="closeEditDialog">取消</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增权限弹窗 -->
    <div
        class="modal-overlay"
        :class="{ modelHide: isAddModalHide }"
        @click.self="closeAddDialog"
    >
      <div class="modal-content">
        <span class="modal-close" @click="closeAddDialog">&times;</span>
        <h3>新增权限</h3>

        <div class="form-container">
          <div class="form-group">
            <label>权限名称:</label>
            <input v-model="newPermission.name" type="text" />
          </div>

          <div class="form-group">
            <label>权限类型:</label>
            <select v-model="newPermission.menuType">
              <option value="DIRECTORY">目录</option>
              <option value="MENU">菜单</option>
              <option value="BUTTON">按钮</option>
            </select>
          </div>

          <div class="form-group">
            <label>权限编码:</label>
            <input v-model="newPermission.code" type="text" />
          </div>

          <div class="form-group">
            <label>路由路径:</label>
            <input v-model="newPermission.path" type="text" />
          </div>

          <div class="form-group">
            <label>父级ID:</label>
            <input v-model.number="newPermission.parentId" type="number" />
          </div>

          <div class="form-group">
            <label>排序:</label>
            <input v-model.number="newPermission.sort" type="number" />
          </div>

          <div class="form-actions">
            <button class="save-btn" @click="saveAddPermission">添加</button>
            <button class="cancel-btn" @click="closeAddDialog">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.permission-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-btn {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.add-btn:hover {
  background-color: #337ecc;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 12px 8px;
  text-align: left;
}

th {
  background-color: #f5f7fa;
  font-weight: bold;
}

tr:hover {
  background-color: #f5f7fa;
}

.type-directory {
  color: #67c23a;
  background-color: #f0f9eb;
  padding: 2px 8px;
  border-radius: 4px;
}

.type-menu {
  color: #409eff;
  background-color: #ecf5ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.type-button {
  color: #e6a23c;
  background-color: #fdf6ec;
  padding: 2px 8px;
  border-radius: 4px;
}

.edit-btn, .delete-btn {
  padding: 4px 8px;
  margin-right: 5px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.edit-btn {
  background-color: #409eff;
  color: white;
}

.delete-btn {
  background-color: #f56c6c;
  color: white;
}

/* 弹窗样式 - 与 RoleInfo.vue 保持一致 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  width: 500px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
  font-size: 20px;
  color: #999;
}

.form-container {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.save-btn, .cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  background-color: #409eff;
  color: white;
}

.cancel-btn {
  background-color: #f4f4f5;
  color: #606266;
}

.modelHide {
  display: none;
}
</style>