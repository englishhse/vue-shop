<template>
  <div id="login">
    <div class="login-box">
      <div class="touxiang">
        <img src="@/assets/logo.png" alt="">
      </div>
      <el-form
      ref="form"
      label-width="0"
      class="form"
      :model="loginForm"
      :rules="loginFormRules">
        <el-form-item prop="username">
          <el-input
          prefix-icon="iconfont icon-users"
          v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
          prefix-icon="iconfont icon-3702mima"
          v-model="loginForm.password"
          type="password"></el-input>
        </el-form-item>
        <el-form-item class="button">
          <el-button type="primary" @click="login">提交</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    data(){
      return {
        loginForm:{
          username:'admin',
          password:'123456'
        },
        loginFormRules:{
          username:[
            {required: true, message: '请输入账号', trigger: 'blur'},
            { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
          ],
          password:[
            {required: true, message: '请输入密码', trigger: 'blur'},
            { min: 6, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
          ]
        }
      }
    },
    methods:{
      resetForm(){
        this.$refs.form.resetFields()
      },
      login(){
        //调用表单预验证
          this.$refs.form.validate(async vali=>{
            if(!vali) return
            // 携带用户名和密码发起登录请求
            const res = await this.$http.post('/login', this.loginForm)
            console.log(res)
            if(res.data.meta.status!==200)return this.$message.error('登陆失败')
            this.$message.success('登陆成功')
            console.log(res.data.data.token)
            //把服务器返回的token存放在sessionStorage中
            window.sessionStorage.setItem('token',res.data.data.token)
            //跳转至home页面
            this.$router.push('/home')
          })
      }
    }
  }
</script>

<style scoped>
  #login {
    background-color: #2b4b6b;
    height: 100%;
  }
  .login-box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
  }
  .touxiang {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%,-50%);
    background-color: #FFFFFF;
  }
  .touxiang img{
    width: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
  .form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
  }
  .button {
    display: flex;
    justify-content: flex-end;
  }

</style>
