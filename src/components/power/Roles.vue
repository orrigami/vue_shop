<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">
            添加角色
          </el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              margin-left="40px"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二三级权限 -->
              <el-col :span="19">
                <!-- 通过for渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级 -->
                  <el-col :span="15">
                    <el-tag
                      type="warning"
                      closable
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <!-- 编辑按钮 -->
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditRoleDialog(scope.row.id)"
            >
              编辑
            </el-button>
            <!-- 删除按钮 -->
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRoleById(scope.row.id)"
            >
              删除
            </el-button>
            <el-button
              @click="showSetRightDialog(scope.row)"
              size="mini"
              type="warning"
              icon="el-icon-search"
            >
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添 加 角 色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClose"
    >
      <!-- 内容主体 -->
      <el-form
        :model="addRoleForm"
        :rules="addRoleFormRules"
        ref="addRoleFormRef"
        label-width="70px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog
      title="修 改 角 色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleDialogClose"
    >
      <el-form
        :model="editRoleForm"
        :rules="editRoleFormRules"
        ref="editRoleFormRef"
        label-width="70px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        node-key="id"
        show-checkbox
        :data="rightList"
        :props="treeProps"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getRoleList()
  },
  data() {
    return {
      // 所有角色列表数据
      roleList: [],
      // 控制添加角色对话框是否显示
      addRoleDialogVisible: false,
      // 添加角色表单数据
      addRoleForm: {
        roleName: '',
        roleDesc: '',
      },
      // 添加角色表单验证规则对象
      addRoleFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur',
          },
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述',
            trigger: 'blur',
          },
        ],
      },
      // 查询角色得到的信息
      editRoleForm: {},
      // 控制修改用户对话框显示
      editRoleDialogVisible: false,
      // 修改表单中的验证规则对象
      editRoleFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur',
          },
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述',
            trigger: 'blur',
          },
        ],
      },
      // 控制分配权限对话框显示
      setRightDialogVisible: false,
      // 所有权限列表
      rightList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children',
      },
      // 默认选中的节点Id数组
      defKeys: [],
      // 角色的id
      roleId: '',
    }
  },
  methods: {
    // 获取所有角色列表数据
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status != 200) return this.$message.error('获取角色列表失败')
      this.roleList = res.data
    },
    // 监听添加角色对话框关闭
    addRoleDialogClose() {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 点击按钮，添加新角色
    addRole() {
      this.$refs.addRoleFormRef.validate(async (vaild) => {
        if (!vaild) return
        // 发起添加请求
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status != 201) this.$message.error('添加角色失败')
        this.$message.success('添加角色成功')
        // 隐藏弹出窗口
        this.addRoleDialogVisible = false
        // 刷新页面
        this.getRoleList()
      })
    },
    // 监听修改角色表单对话框关闭
    editDialogClose() {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 展示编辑角色的对话框
    async showEditRoleDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status != 200) return this.message.error('查询角色信息失败')
      this.editRoleForm = res.data
      this.editRoleDialogVisible = true
    },
    // 监听修改角色表单对话框关闭
    editRoleDialogClose() {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 修改角色信息并提交
    editRoleInfo() {
      this.$refs.editRoleFormRef.validate(async (vaild) => {
        if (!vaild) return
        // 发起修改请求
        const { data: res } = await this.$http.put(
          'roles/' + this.editRoleForm.roleId,
          {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc,
          }
        )
        if (res.meta.status != 200) return this.$message.error('修改用户失败')
        // 隐藏弹出窗口
        this.editRoleDialogVisible = false
        // 刷新页面
        this.getRoleList()
        this.$message.success('修改用户成功')
      })
    },
    // 根据id删除角色(
    async removeRoleById(id) {
      // 弹框确认删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // 若确认删除，返回字符串confirm
      // 若取消删除，返回字符串cancel
      if (confirmResult != 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status != 200) return this.$message.error('删除角色失败')
      this.getRoleList()
      this.$message.success('删除角色成功')
    },
    // 根据id删除对应权限
    async removeRightById(role, rightId) {
      // 弹框确认删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // 若确认删除，返回字符串confirm
      // 若取消删除，返回字符串cancel
      if (confirmResult != 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status != 200) return this.$message.error('删除权限失败')
      role.children = res.data
      this.$message.success('删除权限成功')
    },
    // 展示分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status != 200) return this.$message.error('获取权限数据失败')
      this.rightList = res.data
      this.getLeafKey(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归获取角色三级权限Id，保存在defKeys
    getLeafKey(node, arr) {
      if (!node.children) return arr.push(node.id)

      node.children.forEach((item) => this.getLeafKey(item, arr))
    },
    // 监听分配对话框的关闭时间
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedNodes(),
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status != 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      this.getRoleList()
      this.setRightDialogVisible = false
    },
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
  margin-left: 50px;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>