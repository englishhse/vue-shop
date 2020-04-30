<template>
  <el-container class="home">
    <el-header>
      <div>
        <img src="../assets/img/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="asideWidth">
        <div class="kaiguan" @click="kaiguanClick">|||</div>
        <el-menu
        background-color="#333744"
        text-color="#fff"
        active-text-color="#409eff"
        unique-opened
        :collapse="isCollaps"
        :collapse-transition="false"
        router
        :default-active="activeItem">
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item
            :index="'/'+subItem.path"
            v-for="subItem in item.children"
            :key="subItem.id"
            @click="subItemClick('/'+subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    data(){
      return {
        menuList:[],
        iconObj:{
          '125':'iconfont icon-users',
          '103':'iconfont icon-tijikongjian',
          '101':'iconfont icon-shangpin',
          '102':'iconfont icon-danju',
          '145':'iconfont icon-baobiao'
        },
        isCollaps:false,
        asideWidth:'200px',
        activeItem:'/users'
      }
    },
    methods: {
      logout() {
        window.sessionStorage.clear()
        this.$router.push('/login')
      },
      async getMenuList() {
        const res = await this.$http.get('/menus')
        if(res.data.meta.status!==200) return this.$message.error(res.data.meta.msg)
        this.menuList = res.data.data
      },
      kaiguanClick(){
        this.isCollaps = !this.isCollaps
        this.isCollaps?this.asideWidth='64px':this.asideWidth='200px'
      },
      subItemClick(path){
        this.activeItem = path
        window.sessionStorage.setItem('activePath',path)
      }
    },
    created() {
      this.getMenuList()
      this.activeItem = window.sessionStorage.getItem('activePath')
    }
  }
</script>

<style scoped>
  .home {
    height: 100%;
  }

  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
  }

  .el-header div {
    display: flex;
    align-items: center;
  }

  .kaiguan {
    background-color:#4a5064 ;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    letter-spacing: 0.2em;
    cursor: pointer;
    text-align: center;
  }

  .el-aside {
    background-color: #333744;

  }
  .el-menu {
    border: none;
  }

  .el-main {
    background-color: #eaedf1;
  }
</style>
