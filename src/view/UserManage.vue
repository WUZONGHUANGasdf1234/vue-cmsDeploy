<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  getUserList,
  type User,
  type UserSavePayload,
  addUser,
  updateUser,
  deleteUser
} from "@/http/user.ts";
import { getRoleList, type Role } from "@/http/role.ts";


const userList = ref<User[]>([]);
const roleList = ref<Role[]>([]);

const isHide = ref(true);
const isEdit = ref(false);
const currentId = ref<number | null>(null);

const form = ref<UserSavePayload>({
  username: "",
  roleId: 0,
});

/* 加载数据 */
const loadData = async () => {
  userList.value = await getUserList();
};

/* 加载角色 */
const loadRoles = async () => {
  roleList.value = await getRoleList();
};

onMounted(() => {
  loadData();
  loadRoles();
});

/* 打开新增 */
const openAdd = () => {
  isEdit.value = false;
  form.value = { username: "", roleId: 0 };
  isHide.value = false;
};

/* 打开编辑 */
const openEdit = (user: User) => {
  isEdit.value = true;
  currentId.value = user.id;
  form.value = {
    id: user.id,
    username: user.username,
    roleId: roleList.value.find(r => r.name === user.roleName)?.id || 0,
    password: "" // ✅ 不回显旧密码
  };
  isHide.value = false;
};

/* 保存 */
const save = async () => {
  if (isEdit.value) {
    await updateUser(form.value);
    alert("更新成功");
  } else {
    await addUser(form.value);
    alert("新增成功");
  }
  isHide.value = true;
  await loadData();
};

/* 删除 */
const remove = async (id: number) => {
  if (!confirm("确定删除该用户？")) return;
  await deleteUser(id);
  alert("删除成功");
  await loadData();
};
</script>

<template>
  <div>
    <button @click="openAdd">新增用户</button>

    <table>
      <tr>
        <th>用户名</th>
        <th>所属角色</th>
        <th>创建时间</th>
        <th>操作</th>
      </tr>
      <tr v-for="u in userList" :key="u.id">
        <td>{{ u.username }}</td>
        <td>{{ u.roleName }}</td>
        <td>{{ u.createTime }}</td>
        <td>
          <button @click="openEdit(u)">编辑</button>
          <button @click="remove(u.id)">删除</button>
        </td>
      </tr>
    </table>

    <!-- 弹窗 -->
    <div class="modal" v-show="!isHide">
      <div class="content">
        <h3>{{ isEdit ? '编辑用户' : '新增用户' }}</h3>

        <div>
          <label>用户名</label>
          <input v-model="form.username" />
        </div>

        <div>
          <label>密码</label>
          <input v-model="form.password" type="password" />
        </div>

        <div>
          <label>所属角色</label>
          <select v-model="form.roleId">
            <option disabled value="0">请选择角色</option>
            <option v-for="r in roleList" :key="r.id" :value="r.id">
              {{ r.name }}
            </option>
          </select>
        </div>

        <div style="margin-top: 12px">
          <button @click="save">保存</button>
          <button @click="isHide = true">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
table, th, td {
  border: 1px solid #ccc;
  border-collapse: collapse;
  padding: 8px;
}

button {
  margin-right: 6px;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  background: #fff;
  padding: 20px;
  width: 320px;
}
</style>