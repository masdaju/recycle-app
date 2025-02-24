<template>
  <div class="chat-container">
    <el-row>
      <!-- 用户列表 -->
      <el-col :span="8" class="user-list-container">
        <!-- 过滤选项 -->
        <el-radio-group v-model="filterStatus" @change="filterUsers">
          <el-radio :label="null">全部</el-radio>
          <el-radio :label="0">临时联系人</el-radio>
          <el-radio :label="1">长期联系人</el-radio>
        </el-radio-group>

        <el-card class="user-list-card">
          <div class="header">用户列表</div>
          <div class="user-list">
            <div
                v-for="user in filteredUsers"
                :key="user.account"
                class="user-item"
                :class="{ active: user.account === chatUser }"
                @click="startChat(user.account)"
            >
              <el-avatar :src="user.avatarUrl || defaultAvatar" :size="40" class="avatar" />
              <span class="username">{{ user.account }}</span>
              <span class="status" :class="{ online: isOnline(user.account), offline: !isOnline(user.account) }">
                {{ isOnline(user.account) ? '在线' : '离线' }}
              </span>
              <el-button
                  type="text"
                  size="small"
                  @click.stop="toggleLongTermContact(user.friendUserId, user.status)"
              >
                {{ user.status === 0 ? '添加长期联系' : '取消长期联系' }}
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 聊天框 -->
      <el-col :span="16" class="chat-box-container">
        <div class="chat-box">
          <div class="chat-header">
            <span v-if="chatUser">聊天框（{{ chatUser }}）</span>
            <span v-else>请选择一个用户开始聊天</span>
          </div>

          <!-- 消息区域 -->
          <el-scrollbar style="height: 600px; overflow-y: auto;">
            <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.alignment">
              <el-avatar :src="msg.avatarUrl" alt="头像" size="30" class="avatar" />
              <div>
                <strong>{{ msg.from }}:</strong> {{ msg.message }}
              </div>
            </div>
          </el-scrollbar>

          <!-- 输入区域 -->
          <div class="chat-input">
            <el-input
                v-model="text"
                placeholder="输入消息..."
                rows="1"
                type="textarea"
                auto-size
                :disabled="!chatUser"
                show-word-limit
                maxlength="300"
            />
            <el-button
                type="primary"
                :disabled="!text || !chatUser"
                @click="sendMessage"
                style="margin-top: 10px"
            >
              发送
            </el-button>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getRelationListService, saveMessage, getMessage,addRelationService,toggleLongTermContactService} from "@/api/chat.js";
import useUserInfoStore from "@/stores/userInfo.js";
import { ElMessage } from "element-plus";
import { useRoute } from 'vue-router';

const route = useRoute();
const userInfoStore = useUserInfoStore();
const filterStatus = ref(null); // 过滤状态，null表示不过滤
const username = userInfoStore.info.account;
const allUsers = ref([]); // 所有用户，包括离线和在线
const filteredUsers = ref([]); // 过滤后的用户列表
const users = ref([]); // 在线用户
const chatUser = ref('');
const text = ref('');
const messages = ref([]); // 存储消息内容的数组
const socket = new WebSocket(`/imserver/${username}`);
const defaultAvatar = "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"; // 默认头像

socket.onopen = () => {
  console.log("WebSocket 已连接");
  setInterval(() => {
    const heartbeatMessage = { type: 'heartbeat' };
    socket.send(JSON.stringify(heartbeatMessage));
  }, 10000);
};
// 获取所有用户并区分在线/离线状态
const userList = async () => {
  try {
    const result = await getRelationListService();
    allUsers.value = result.data.filter(user => user.account !== username);
    filterUsers(); // 初始加载时就应用当前过滤条件
  } catch (error) {
    console.error('Error fetching user list:', error);
    ElMessage.error('获取用户列表失败');
  }
};
const toggleLongTermContact = async (friendUserId,status) => {

  let param = {
    fid: friendUserId,
    status: status

  }
  try {
    const result = await toggleLongTermContactService(param);
    if (result.code === 200) {
      ElMessage.success(status === 0 ? '添加长期联系成功' : '取消长期联系成功');
      await userList(); // 重新获取用户列表以更新状态
    }
  } catch (error) {
    console.error('Error fetching user list:', error);

  }

}
// 通过 WebSocket 获取在线用户列表
socket.onmessage = (msg) => {
  const data = JSON.parse(msg.data);
  if (data.users) {
    users.value = data.users.map(user => user.username);
  } else {
    // 接收到消息
    createMessage(data.from, data.text, false);
  }
};

// 检查用户是否在线
const isOnline = (account) => {
  return users.value.includes(account);
};

const startChat = (user) => {
  chatUser.value = user;
  messages.value = []; // 清空之前的消息
  loadMessages();
};

const sendMessage = async () => {
  if (!chatUser.value || !text.value) {
    alert("请选择聊天对象并输入消息");
    return;
  }

  const message = { from: username, to: chatUser.value, text: text.value };

  if (isOnline(chatUser.value)) {
    await saveMessage({
      sendUserAccount: username,
      acceptUserAccount: chatUser.value,
      content: text.value
    });
    socket.send(JSON.stringify(message)); // 在线用户，使用 WebSocket 发送消息
  } else {
    await saveMessage({
      sendUserAccount: username,
      acceptUserAccount: chatUser.value,
      content: text.value
    }); // 离线用户，直接保存消息到数据库
  }

  createMessage(username, text.value, true); // 显示自己发送的消息
  text.value = ''; // 清空输入框
};

const createMessage = (from, message, isSelf) => {
  const alignment = isSelf ? 'right' : 'left';

  // 获取发送者头像
  const user = allUsers.value.find(user => user.account === from);
  let avatarUrl = isSelf ? userInfoStore.info.avatarUrl : (user ? user.avatarUrl : defaultAvatar);

  // 将消息作为对象存储
  messages.value.push({
    from,
    message,
    alignment,
    avatarUrl
  });
};

const loadMessages = async () => {
  try {
    const params = {
      sendUserAccount: username,
      acceptUserAccount: chatUser.value
    };
    const response = await getMessage(params);
    response.data.forEach(msg => {
      createMessage(msg.sendUserAccount, msg.content, msg.sendUserAccount === username);
    });
  } catch (error) {
    console.error("加载消息失败", error);
  }
};

// 根据 filterStatus 过滤用户列表
const filterUsers = () => {
  if (filterStatus.value === null) {
    filteredUsers.value = allUsers.value;
  } else {
    filteredUsers.value = allUsers.value.filter(user => user.status === filterStatus.value);
  }
  console.log(filteredUsers.value)
};

onMounted(() => {
  userList();
  if (route.query.username) {
    addRelationService(route.query.username);
    userList();
    startChat(route.query.username);
  }
});
</script>

<style scoped>
.chat-container {
  padding: 20px;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 5px 0;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.status.online {
  color: green;
}

.status.offline {
  color: red;
}

.chat-box {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.chat-header {
  text-align: center;
  font-weight: bold;
}

.chat-content {
  height: 300px;
  overflow-y: auto;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  padding: 10px;
}

.message {
  display: flex;
  align-items: center;
  padding: 5px;
  margin: 5px 0;
}

.message img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.message.right {
  flex-direction: row-reverse;
}

.message.right img {
  margin-left: 10px;
  margin-right: 0;
}

.message.left {
  text-align: left;
}

.message.right {
  text-align: right;
}

.user-list-card {
  height: 690px;
  overflow-y: auto;
}
</style>
