// App Data
const appData = {
  "user": {
    "name": "Maria Silva",
    "bcBalance": 1247,
    "realBalance": 12.47,
    "twoFAEnabled": false,
    "profilePicture": "👩‍💼"
  },
  "transactions": [
    {"id": 1, "type": "gain", "amount": 20, "description": "Transação confirmada", "timestamp": "2025-09-28T09:30:00", "category": "security"},
    {"id": 2, "type": "gain", "amount": 150, "description": "Assinatura duplicada cancelada", "timestamp": "2025-09-27T14:20:00", "category": "finance"},
    {"id": 3, "type": "redeem", "amount": -500, "description": "Desconto conta de luz", "timestamp": "2025-09-26T10:15:00", "category": "bills"},
    {"id": 4, "type": "gain", "amount": 200, "description": "Meta de economia atingida", "timestamp": "2025-09-25T08:45:00", "category": "finance"},
    {"id": 5, "type": "gain", "amount": 50, "description": "Revisão de segurança", "timestamp": "2025-09-24T16:30:00", "category": "security"},
    {"id": 6, "type": "gain", "amount": 25, "description": "Transação confirmada", "timestamp": "2025-09-23T11:20:00", "category": "security"},
    {"id": 7, "type": "redeem", "amount": -300, "description": "Desconto Netflix", "timestamp": "2025-09-22T19:45:00", "category": "partners"},
    {"id": 8, "type": "gain", "amount": 100, "description": "Pagamento pontual", "timestamp": "2025-09-21T12:10:00", "category": "finance"}
  ],
  "redeemOptions": [
    {"id": 1, "title": "Desconto Conta de Luz", "cost": 1000, "value": "R$ 10,00", "category": "bills", "icon": "⚡"},
    {"id": 2, "title": "Netflix - 50% desconto", "cost": 500, "value": "1º mês", "category": "partners", "icon": "🎬"},
    {"id": 3, "title": "iFood - R$ 15 off", "cost": 1500, "value": "R$ 15,00", "category": "partners", "icon": "🍕"},
    {"id": 4, "title": "Relatório Premium", "cost": 2000, "value": "Análise completa", "category": "premium", "icon": "📊"},
    {"id": 5, "title": "Cashback Extra", "cost": 800, "value": "2% extra por 30 dias", "category": "premium", "icon": "💰"}
  ],
  "notifications": [
    {"id": 1, "title": "Transação Suspeita Detectada", "message": "Compra de R$ 89,90 no E-commerce XYZ", "type": "security", "pending": true, "reward": 20},
    {"id": 2, "title": "Assinatura Duplicada", "message": "Detectamos 2 assinaturas Netflix ativas", "type": "finance", "pending": true, "reward": 150},
    {"id": 3, "title": "Meta Quase Atingida", "message": "Você está a R$ 50 da sua meta mensal", "type": "finance", "pending": false, "reward": 0}
  ],
  "chatMessages": {
    "sec": [
      {"sender": "bot", "message": "Olá Maria! Detectei uma compra suspeita de R$ 89,90 no E-commerce XYZ há 5 minutos. Foi você?", "timestamp": "09:45"},
      {"sender": "bot", "message": "🎁 Ao confirmar, você ganha 20 BC pela verificação de segurança!", "timestamp": "09:45"}
    ],
    "finance": [
      {"sender": "bot", "message": "Oi Maria! Analisando suas contas, identifiquei uma oportunidade de economia.", "timestamp": "14:30"},
      {"sender": "bot", "message": "Você tem 2 assinaturas Netflix ativas: R$ 32,90 e R$ 25,90. Posso ajudar a cancelar uma?", "timestamp": "14:31"},
      {"sender": "bot", "message": "💰 Cancelando a duplicata, você economiza R$ 310,80/ano e ganha 150 BC + 155 BC de bônus!", "timestamp": "14:31"}
    ]
  },
  "goals": [
    {"id": 1, "title": "Economia Mensal", "current": 450, "target": 500, "reward": 200, "unit": "R$"},
    {"id": 2, "title": "Ações de Segurança", "current": 3, "target": 5, "reward": 100, "unit": "ações"},
    {"id": 3, "title": "Pagamentos Pontuais", "current": 4, "target": 6, "reward": 150, "unit": "contas"}
  ]
};

// Global state
let currentScreen = 'dashboard';
let currentChatType = 'sec';
let currentNotification = null;
let pendingNotifications = appData.notifications.filter(n => n.pending);

// Screen Navigation
function showScreen(screenId) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show target screen
  document.getElementById(screenId + '-screen').classList.add('active');
  
  // Update navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  currentScreen = screenId;
}

function showDashboard() {
  showScreen('dashboard');
  document.querySelector('.nav-btn').classList.add('active');
}

function showWallet() {
  showScreen('wallet');
  document.querySelectorAll('.nav-btn')[1].classList.add('active');
  loadTransactions();
}

function showRedeemStore() {
  showScreen('store');
  document.querySelectorAll('.nav-btn')[2].classList.add('active');
  loadStoreItems();
}

function showChat(type = 'sec') {
  currentChatType = type;
  showScreen('chat');
  document.querySelectorAll('.nav-btn')[3].classList.add('active');
  loadChatMessages(type);
  
  // Show chat actions for security type
  const chatActions = document.getElementById('chat-actions');
  if (type === 'sec') {
    chatActions.style.display = 'flex';
  } else {
    chatActions.innerHTML = `
      <button class="btn btn--outline" onclick="sendChatResponse('no')">❌ Não quero</button>
      <button class="btn btn--primary" onclick="sendChatResponse('yes')">✅ Sim, cancelar</button>
    `;
    chatActions.style.display = 'flex';
  }
}

function showProfile() {
  showScreen('profile');
  document.querySelectorAll('.nav-btn')[4].classList.add('active');
  loadGoals();
}

// Chat functionality
function loadChatMessages(type) {
  const messages = appData.chatMessages[type] || [];
  const chatMessagesContainer = document.getElementById('chat-messages');
  const agentName = document.getElementById('agent-name');
  const agentAvatar = document.getElementById('agent-avatar');
  
  // Update agent info
  if (type === 'sec') {
    agentName.textContent = 'Bemobi Sec+';
    agentAvatar.textContent = '🛡️';
  } else if (type === 'finance') {
    agentName.textContent = 'Bemobi Finance';
    agentAvatar.textContent = '💼';
  }
  
  // Clear and load messages
  chatMessagesContainer.innerHTML = '';
  
  messages.forEach(msg => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.sender}`;
    messageDiv.innerHTML = `
      <div class="message-text">${msg.message}</div>
      <div class="message-time">${msg.timestamp}</div>
    `;
    chatMessagesContainer.appendChild(messageDiv);
  });
  
  // Scroll to bottom
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

function sendChatResponse(response) {
  const chatMessagesContainer = document.getElementById('chat-messages');
  
  // Add user message
  const userMessage = document.createElement('div');
  userMessage.className = 'message user';
  
  if (currentChatType === 'sec') {
    if (response === 'yes') {
      userMessage.innerHTML = `
        <div class="message-text">✅ Sim, fui eu que fiz essa compra</div>
        <div class="message-time">09:46</div>
      `;
      
      // Add bot response
      setTimeout(() => {
        const botResponse = document.createElement('div');
        botResponse.className = 'message bot';
        botResponse.innerHTML = `
          <div class="message-text">Perfeito! Transação confirmada com sucesso. Você ganhou 20 BC! 🎉</div>
          <div class="message-time">09:46</div>
        `;
        chatMessagesContainer.appendChild(botResponse);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        
        // Award coins and show animation
        awardCoins(20, 'Transação confirmada');
        
        // Remove pending notification
        pendingNotifications = pendingNotifications.filter(n => n.type !== 'security');
        updateNotificationBadge();
        
      }, 1000);
      
    } else {
      userMessage.innerHTML = `
        <div class="message-text">❌ Não, não fui eu</div>
        <div class="message-time">09:46</div>
      `;
      
      setTimeout(() => {
        const botResponse = document.createElement('div');
        botResponse.className = 'message bot';
        botResponse.innerHTML = `
          <div class="message-text">Entendi! Vou bloquear o cartão imediatamente e iniciar o processo de contestação. Você receberá um novo cartão em 3-5 dias úteis.</div>
          <div class="message-time">09:46</div>
        `;
        chatMessagesContainer.appendChild(botResponse);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
      }, 1000);
    }
  } else if (currentChatType === 'finance') {
    if (response === 'yes') {
      userMessage.innerHTML = `
        <div class="message-text">✅ Sim, pode cancelar a assinatura duplicada</div>
        <div class="message-time">14:32</div>
      `;
      
      setTimeout(() => {
        const botResponse = document.createElement('div');
        botResponse.className = 'message bot';
        botResponse.innerHTML = `
          <div class="message-text">Cancelamento realizado! Economia de R$ 310,80/ano garantida. Você ganhou 150 BC + 155 BC de bônus! 🎉</div>
          <div class="message-time">14:32</div>
        `;
        chatMessagesContainer.appendChild(botResponse);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        
        // Award coins
        awardCoins(305, 'Assinatura duplicada cancelada');
        
        // Remove pending notification
        pendingNotifications = pendingNotifications.filter(n => n.type !== 'finance');
        updateNotificationBadge();
        
      }, 1000);
    } else {
      userMessage.innerHTML = `
        <div class="message-text">❌ Não, quero manter as duas</div>
        <div class="message-time">14:32</div>
      `;
      
      setTimeout(() => {
        const botResponse = document.createElement('div');
        botResponse.className = 'message bot';
        botResponse.innerHTML = `
          <div class="message-text">Sem problemas! Vou monitorar suas assinaturas e te avisar sobre outras oportunidades de economia.</div>
          <div class="message-time">14:32</div>
        `;
        chatMessagesContainer.appendChild(botResponse);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
      }, 1000);
    }
  }
  
  chatMessagesContainer.appendChild(userMessage);
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  
  // Hide chat actions after response
  document.getElementById('chat-actions').style.display = 'none';
}

// Wallet functionality
function loadTransactions() {
  const transactionList = document.getElementById('transaction-list');
  transactionList.innerHTML = '';
  
  appData.transactions.forEach(transaction => {
    const transactionDiv = document.createElement('div');
    transactionDiv.className = 'transaction-item';
    
    const icon = transaction.type === 'gain' ? '⬆️' : '⬇️';
    const iconClass = transaction.type;
    const amountClass = transaction.type;
    const amountPrefix = transaction.amount > 0 ? '+' : '';
    
    const date = new Date(transaction.timestamp);
    const formattedDate = formatRelativeDate(date);
    
    transactionDiv.innerHTML = `
      <div class="transaction-icon ${iconClass}">${icon}</div>
      <div class="transaction-details">
        <span class="transaction-title">${transaction.description}</span>
        <span class="transaction-time">${formattedDate}</span>
      </div>
      <span class="transaction-amount ${amountClass}">${amountPrefix}${Math.abs(transaction.amount)} BC</span>
    `;
    
    transactionList.appendChild(transactionDiv);
  });
}

function filterTransactions(type) {
  // Update active filter
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Filter and display transactions
  const transactionList = document.getElementById('transaction-list');
  transactionList.innerHTML = '';
  
  const filteredTransactions = type === 'all' 
    ? appData.transactions 
    : appData.transactions.filter(t => t.type === type);
  
  filteredTransactions.forEach(transaction => {
    const transactionDiv = document.createElement('div');
    transactionDiv.className = 'transaction-item';
    
    const icon = transaction.type === 'gain' ? '⬆️' : '⬇️';
    const iconClass = transaction.type;
    const amountClass = transaction.type;
    const amountPrefix = transaction.amount > 0 ? '+' : '';
    
    const date = new Date(transaction.timestamp);
    const formattedDate = formatRelativeDate(date);
    
    transactionDiv.innerHTML = `
      <div class="transaction-icon ${iconClass}">${icon}</div>
      <div class="transaction-details">
        <span class="transaction-title">${transaction.description}</span>
        <span class="transaction-time">${formattedDate}</span>
      </div>
      <span class="transaction-amount ${amountClass}">${amountPrefix}${Math.abs(transaction.amount)} BC</span>
    `;
    
    transactionList.appendChild(transactionDiv);
  });
}

// Store functionality
function loadStoreItems() {
  const storeItems = document.getElementById('store-items');
  storeItems.innerHTML = '';
  
  appData.redeemOptions.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'store-item';
    itemDiv.onclick = () => redeemItem(item);
    
    const canAfford = appData.user.bcBalance >= item.cost;
    const affordClass = canAfford ? '' : 'style="opacity: 0.5; cursor: not-allowed;"';
    
    itemDiv.innerHTML = `
      <div class="store-icon">${item.icon}</div>
      <div class="store-details">
        <span class="store-title">${item.title}</span>
        <span class="store-value">${item.value}</span>
      </div>
      <div class="store-cost" ${affordClass}>${item.cost} BC</div>
    `;
    
    if (!canAfford) {
      itemDiv.style.opacity = '0.5';
      itemDiv.style.cursor = 'not-allowed';
      itemDiv.onclick = null;
    }
    
    storeItems.appendChild(itemDiv);
  });
}

function filterStore(category) {
  // Update active category
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Filter and display items
  const storeItems = document.getElementById('store-items');
  storeItems.innerHTML = '';
  
  const filteredItems = category === 'all'
    ? appData.redeemOptions
    : appData.redeemOptions.filter(item => item.category === category);
  
  filteredItems.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'store-item';
    itemDiv.onclick = () => redeemItem(item);
    
    const canAfford = appData.user.bcBalance >= item.cost;
    
    itemDiv.innerHTML = `
      <div class="store-icon">${item.icon}</div>
      <div class="store-details">
        <span class="store-title">${item.title}</span>
        <span class="store-value">${item.value}</span>
      </div>
      <div class="store-cost">${item.cost} BC</div>
    `;
    
    if (!canAfford) {
      itemDiv.style.opacity = '0.5';
      itemDiv.style.cursor = 'not-allowed';
      itemDiv.onclick = null;
    }
    
    storeItems.appendChild(itemDiv);
  });
}

function redeemItem(item) {
  if (appData.user.bcBalance < item.cost) return;
  
  // Simulate redemption process
  const modal = document.getElementById('notification-modal');
  const modalBody = document.getElementById('notification-body');
  
  modalBody.innerHTML = `
    <div style="padding: 16px 20px;">
      <p><strong>Confirmar Resgate</strong></p>
      <p>Deseja resgatar <strong>${item.title}</strong> por <strong>${item.cost} BC</strong>?</p>
      <p>Valor: ${item.value}</p>
      <p>Saldo atual: ${appData.user.bcBalance} BC</p>
      <p>Saldo após resgate: ${appData.user.bcBalance - item.cost} BC</p>
    </div>
  `;
  
  const actions = modal.querySelector('.notification-actions');
  actions.innerHTML = `
    <button class="btn btn--secondary" onclick="dismissNotification()">Cancelar</button>
    <button class="btn btn--primary" onclick="confirmRedemption(${item.id}, ${item.cost})">Confirmar</button>
  `;
  
  modal.classList.remove('hidden');
}

function confirmRedemption(itemId, cost) {
  // Update balance
  appData.user.bcBalance -= cost;
  appData.user.realBalance = appData.user.bcBalance / 100;
  
  // Add transaction
  const newTransaction = {
    id: Date.now(),
    type: 'redeem',
    amount: -cost,
    description: appData.redeemOptions.find(item => item.id === itemId).title,
    timestamp: new Date().toISOString(),
    category: appData.redeemOptions.find(item => item.id === itemId).category
  };
  
  appData.transactions.unshift(newTransaction);
  
  // Update UI
  updateBalance();
  dismissNotification();
  
  // Show success message
  setTimeout(() => {
    const modal = document.getElementById('notification-modal');
    const modalBody = document.getElementById('notification-body');
    
    modalBody.innerHTML = `
      <div style="padding: 16px 20px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
        <p><strong>Resgate Realizado!</strong></p>
        <p>Seu resgate foi processado com sucesso.</p>
        <p>Verifique seu e-mail para mais detalhes.</p>
      </div>
    `;
    
    const actions = modal.querySelector('.notification-actions');
    actions.innerHTML = `
      <button class="btn btn--primary" onclick="dismissNotification()" style="width: 100%;">Fechar</button>
    `;
    
    modal.classList.remove('hidden');
    
    // Reload store items to update affordability
    loadStoreItems();
    
  }, 100);
}

// Profile functionality
function loadGoals() {
  const goalsList = document.getElementById('goals-list');
  goalsList.innerHTML = '';
  
  appData.goals.forEach(goal => {
    const goalDiv = document.createElement('div');
    goalDiv.className = 'goal-item';
    
    const percentage = (goal.current / goal.target) * 100;
    
    goalDiv.innerHTML = `
      <div>
        <div class="goal-name">${goal.title}</div>
        <div class="goal-progress-text">${goal.current} de ${goal.target} ${goal.unit}</div>
      </div>
      <div class="goal-reward">+${goal.reward} BC</div>
    `;
    
    goalsList.appendChild(goalDiv);
  });
}

function toggle2FA() {
  const toggle = document.getElementById('twofa-toggle');
  const status = toggle.querySelector('.toggle-status');
  
  if (!appData.user.twoFAEnabled) {
    // Enable 2FA
    appData.user.twoFAEnabled = true;
    status.textContent = 'Ativo';
    status.classList.add('active');
    
    // Award coins
    awardCoins(300, 'Ativação do 2FA');
    
    // Add to transactions
    const newTransaction = {
      id: Date.now(),
      type: 'gain',
      amount: 300,
      description: 'Ativação do 2FA',
      timestamp: new Date().toISOString(),
      category: 'security'
    };
    
    appData.transactions.unshift(newTransaction);
  } else {
    // Disable 2FA
    appData.user.twoFAEnabled = false;
    status.textContent = 'Inativo';
    status.classList.remove('active');
  }
}

// Notification system
function showPendingNotification() {
  if (pendingNotifications.length === 0) return;
  
  currentNotification = pendingNotifications[0];
  const modal = document.getElementById('notification-modal');
  const modalBody = document.getElementById('notification-body');
  
  modalBody.innerHTML = `
    <div style="padding: 16px 20px;">
      <h4>${currentNotification.title}</h4>
      <p>${currentNotification.message}</p>
      ${currentNotification.reward > 0 ? `<p style="color: var(--color-success); font-weight: bold;">🎁 Ganhe ${currentNotification.reward} BC</p>` : ''}
    </div>
  `;
  
  modal.classList.remove('hidden');
}

function handleNotification() {
  if (!currentNotification) return;
  
  const notificationType = currentNotification.type;
  
  // First dismiss the notification modal
  dismissNotification();
  
  // Then navigate to the appropriate chat after a brief delay
  setTimeout(() => {
    if (notificationType === 'security') {
      showChat('sec');
    } else if (notificationType === 'finance') {
      showChat('finance');
    }
  }, 100);
}

function dismissNotification() {
  document.getElementById('notification-modal').classList.add('hidden');
  currentNotification = null;
}

function updateNotificationBadge() {
  const badge = document.querySelector('.notification-badge');
  const count = pendingNotifications.length;
  
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
}

// Coin animation and balance updates
function awardCoins(amount, reason) {
  // Update balance
  appData.user.bcBalance += amount;
  appData.user.realBalance = appData.user.bcBalance / 100;
  
  // Show coin animation
  const coinRain = document.getElementById('coin-animation');
  coinRain.classList.remove('hidden');
  
  // Hide animation after 2 seconds
  setTimeout(() => {
    coinRain.classList.add('hidden');
  }, 2000);
  
  // Update balance display
  updateBalance();
  
  // Add transaction
  const newTransaction = {
    id: Date.now(),
    type: 'gain',
    amount: amount,
    description: reason,
    timestamp: new Date().toISOString(),
    category: 'bonus'
  };
  
  appData.transactions.unshift(newTransaction);
}

function updateBalance() {
  // Update dashboard balance
  const bcAmount = document.querySelector('.bc-amount');
  const realAmount = document.querySelector('.real-amount');
  
  if (bcAmount) bcAmount.textContent = `${appData.user.bcBalance.toLocaleString()} BC`;
  if (realAmount) realAmount.textContent = `= R$ ${appData.user.realBalance.toFixed(2)}`;
  
  // Update wallet balance
  const walletBalance = document.querySelector('.current-balance');
  const realEquivalent = document.querySelector('.real-equivalent');
  
  if (walletBalance) walletBalance.textContent = `${appData.user.bcBalance.toLocaleString()} BC`;
  if (realEquivalent) realEquivalent.textContent = `R$ ${appData.user.realBalance.toFixed(2)} disponível`;
}

// Utility functions
function formatRelativeDate(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Initialize app
function initializeApp() {
  updateNotificationBadge();
  updateBalance();
  
  // Auto-show notification after 3 seconds
  setTimeout(() => {
    if (pendingNotifications.length > 0) {
      showPendingNotification();
    }
  }, 3000);
  
  // Update time every minute
  setInterval(() => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    document.querySelector('.time').textContent = timeStr;
  }, 60000);
}

// Start the app
document.addEventListener('DOMContentLoaded', initializeApp);