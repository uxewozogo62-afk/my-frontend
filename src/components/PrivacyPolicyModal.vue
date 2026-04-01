<template>
  <a-modal
    v-model:open="visible"
    title="智驭暖芯智慧康养平台隐私政策"
    :closable="false"
    :maskClosable="false"
    :keyboard="false"
    width="700px"
  >
    <div class="privacy-modal-body">
      <!-- 协议全文滚动区域 -->
      <div class="policy-detail-box">
        <div class="policy-content">
          <h2 class="main-title">智驭暖芯智慧康养平台隐私政策</h2>
          
          <h3>引言</h3>
          <p>欢迎使用智驭暖芯智慧康养平台，本政策旨在清晰说明我们如何收集、使用、存储和保护您的个人信息。作为一家专注于智慧康养服务的高科技企业，我们深知健康数据的敏感性和重要性，特别针对老年用户群体的使用特点，我们制定了更加严格的数据保护标准。</p>
          <p>本政策适用于智驭暖芯智能手环、AI 陪护宠物设备、云端协同平台及相关服务，请您在使用前仔细阅读并理解全部内容。如您对本政策有任何疑问，可通过文末提供的联系方式咨询我们的数据保护负责人。</p>
          
          <h3>一、个人信息收集与使用</h3>
          <p>在您使用智驭暖芯服务过程中，我们会基于以下目的收集和使用您的信息：</p>
          <p>账号注册需要收集手机号码用于身份验证和重要服务通知，健康监测功能需要持续收集心率、血压、血氧等生理指标数据用于健康趋势分析，位置服务需要获取精确位置信息用于防走失等安全防护，AI 陪护功能需要处理语音交互数据以提供个性化情感陪伴。</p>
          <p>我们承诺遵循最小必要原则，仅收集实现产品功能所必需的信息，且会对敏感健康数据进行加密处理。在开展学术研究或产品优化时，我们将对数据进行匿名化处理，确保无法识别特定个人身份。</p>
          
          <h3>二、数据共享与转让规则</h3>
          <p>我们高度重视您的数据安全，绝不会将您的个人信息出售给第三方。仅在以下特定情况下，我们会与合作伙伴共享必要信息：</p>
          <p>医疗急救时需要向签约医院共享健康数据以保障您的生命安全，社区服务需要向网格员提供有限的健康状态信息以便及时提供帮助，科研合作需要在完全匿名化后使用数据进行康养研究。</p>
          <p>所有数据共享行为都会经过严格的安全评估，并签订数据保护协议，要求合作伙伴承担与本政策同等水准的保护义务。</p>
          
          <h3>三、数据存储与安全保护</h3>
          <p>您的个人信息将存储于中华人民共和国境内的安全服务器上，其中敏感健康数据采用加密技术进行存储，数据传输过程全程使用加密协议保护。我们建立了完善的数据分级管理制度，对工作人员实行严格的权限管控，定期开展安全审计和漏洞扫描。数据保存期限为您使用服务期间及服务终止后 2 年，法律法规另有规定的除外。如发生数据安全事件，我们将立即启动应急预案，并在 72 小时内向监管部门和受影响用户报告。</p>
          
          <h3>四、用户权利保障</h3>
          <p>您享有完整的个人信息权利，包括通过"我的"页面随时访问、更正基本个人信息，通过客服渠道申请导出完整的健康数据报告，对非必要数据处理随时撤回授权同意，在服务终止后申请删除个人信息。特别设置适老化操作界面，支持大字体显示和语音朗读功能，方便老年用户行使各项权利。账号注销需要在客户端提交申请，我们将于 15 个工作日内完成处理并删除相应数据。</p>
          
          <h3>五、未成年人保护特别规定</h3>
          <p>我们的产品主要面向成年用户，原则上不接受未成年人注册使用。如确需为未成年人提供服务，必须得到监护人的明确同意，并按照《未成年人保护法》等相关法律法规要求，采取严格的保护措施，包括限制数据收集范围、加强访问控制、设置使用时长管理等。监护人有权随时查看、更正或删除未成年人的个人信息。</p>
          
          <h3>六、政策更新与联系方式</h3>
          <p>随着技术发展和法律法规变化，我们可能适时修订本政策。如发生实质性变更，我们将通过平台公告、弹窗提示等方式通知您。如您对本政策有任何疑问或建议，可通过客服电话 15247495046、邮箱 xuwenbo_2024@qq.com 或邮寄至内蒙古自治区呼和浩特市大学西路 235 号与我们联系，并注明"隐私政策咨询"。对于您的合理请求，我们原则上不收取费用，但在超出合理限度时，可能会收取一定的成本费用。</p>
          
          <h3>附则</h3>
          <p>本政策中使用但未定义的术语具有《个人信息保护法》规定的含义。如您不同意本政策内容，请立即停止使用我们的服务。继续使用即表示您已充分阅读、理解并同意接受本政策的全部内容。</p>
        </div>
      </div>

      <!-- 勾选区域 -->
      <div class="agreement-check">
        <a-checkbox v-model:checked="isAgreed">
          我已阅读并充分理解上述隐私政策的全部内容
        </a-checkbox>
      </div>
    </div>

    <!-- 自定义页脚按钮 -->
    <template #footer>
      <div class="modal-footer">
        <a-button @click="handleDecline">不同意</a-button>
        <a-button 
          type="primary" 
          :disabled="!isAgreed" 
          @click="handleAccept"
        >
          同意并继续
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';

const visible = ref(false);
const isAgreed = ref(false);
const STORAGE_KEY = 'zhiyunuanxin_privacy_accepted';

onMounted(() => {
  const accepted = localStorage.getItem(STORAGE_KEY);
  if (!accepted) {
    visible.value = true;
  }
});

const handleAccept = () => {
  if (!isAgreed.value) return;
  localStorage.setItem(STORAGE_KEY, 'true');
  visible.value = false;
  message.success('感谢您的信任，您已同意隐私政策');
};

const handleDecline = () => {
  Modal.confirm({
    title: '温馨提示',
    content: '不同意隐私政策将无法使用本平台的核心功能，是否确认退出？',
    okText: '确认退出',
    cancelText: '再看看',
    onOk: () => {
      message.info('请关闭浏览器或重新考虑');
    }
  });
};
</script>

<style scoped>
.privacy-modal-body {
  padding: 0;
}
.policy-detail-box {
  background-color: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 15px;
  max-height: 400px;
  overflow-y: auto;
}
.main-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}
.policy-content h3 {
  font-size: 16px;
  font-weight: bold;
  margin: 16px 0 8px 0;
  color: #1890ff;
  border-left: 4px solid #1890ff;
  padding-left: 10px;
}
.policy-content p {
  font-size: 14px;
  line-height: 1.8;
  color: #555;
  margin-bottom: 12px;
  text-align: justify;
}
.agreement-check {
  padding: 10px 0;
  border-top: 1px solid #f0f0f0;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
/* 自定义滚动条样式 */
.policy-detail-box::-webkit-scrollbar {
  width: 6px;
}
.policy-detail-box::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}
.policy-detail-box::-webkit-scrollbar-track {
  background: #f5f5f5;
}
</style>