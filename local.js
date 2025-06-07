// База данных (эмуляция SQLite)
let database = {
    users: [],
    ideas: [],
    votes: [],
    comments: []
};

let currentUser = null;

// Коды доступа для разных ролей
const accessCodes = {
    'REGION-2024': 'regional',
    'OBLAST-2024': 'oblast',
    'REPUB-2024': 'republican',
    'PRES-2024': 'president'
};

// Сохранение данных в localStorage
function saveDatabase() {
    localStorage.setItem('database', JSON.stringify(database));
}

// Загрузка данных из localStorage
function loadDatabase() {
    const saved = localStorage.getItem('database');
    if (saved) {
        database = JSON.parse(saved);
    }
}

// Инициализация приложения
function initApp() {
    loadDatabase();
    if (database.ideas.length === 0) {
        addTestData();
        saveDatabase();
    }
}

// Добавление тестовых данных
function addTestData() {
    const testIdeas = [
        {
            id: 1,
            title: "Установка велосипедных дорожек в центре Алматы",
            description: "Предлагаю создать сеть велосипедных дорожек в центральной части города для улучшения экологической ситуации и развития альтернативного транспорта.",
            category: "transport",
            region: "almaty",
            status: "new",
            author: "Гражданин Казахстана",
            authorId: "test_citizen",
            date: new Date().toISOString(),
            votes: 45
        },
        {
            id: 2,
            title: "Программа озеленения дворов",
            description: "Инициатива по высадке деревьев и созданию зеленых зон во дворах жилых домов для улучшения экологии и качества жизни горожан.",
            category: "environment",
            region: "astana",
            status: "review",
            author: "Гражданин Казахстана",
            authorId: "test_citizen2",
            date: new Date(Date.now() - 86400000).toISOString(),
            votes: 32
        },
        {
            id: 3,
            title: "Цифровизация школьного образования",
            description: "Проект по внедрению современных цифровых технологий в образовательный процесс средних школ для повышения качества обучения.",
            category: "education",
            region: "shymkent",
            status: "approved",
            author: "Гражданин Казахстана",
            authorId: "test_citizen3",
            date: new Date(Date.now() - 172800000).toISOString(),
            votes: 78
        }
    ];

    database.ideas = testIdeas;
}

// Переключение вкладок
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    if (tabName === 'dashboard') updateDashboard();
    if (tabName === 'ideas') loadAllIdeas();
    if (tabName === 'admin') loadAdminPanel();
}

// Переключение поля кода доступа
function toggleAccessCode() {
    const userType = document.getElementById('userType').value;
    const accessCodeGroup = document.getElementById('accessCodeGroup');

    if (userType !== 'citizen') {
        accessCodeGroup.classList.remove('hidden');
    } else {
        accessCodeGroup.classList.add('hidden');
    }
}

// Регистрация
function register() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const userType = document.getElementById('userType').value;
    const accessCode = document.getElementById('accessCode').value;

    if (!name || !email || !password) {
        showAlert('loginAlert', 'Заполните все обязательные поля', 'error');
        return;
    }

    if (database.users.find(u => u.email === email)) {
        showAlert('loginAlert', 'Пользователь с таким email уже существует', 'error');
        return;
    }

    if (userType !== 'citizen') {
        if (!accessCode || !accessCodes[accessCode]) {
            showAlert('loginAlert', 'Неверный код доступа', 'error');
            return;
        }

        if (accessCodes[accessCode] !== userType) {
            showAlert('loginAlert', 'Код доступа не соответствует выбранной роли', 'error');
            return;
        }
    }

    const user = {
        id: Date.now().toString(),
        name,
        email,
        password,
        type: userType,
        registrationDate: new Date().toISOString()
    };

    database.users.push(user);
    saveDatabase();

    showAlert('loginAlert', 'Регистрация успешна! Теперь вы можете войти в систему.', 'success');

    document.getElementById('regName').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('accessCode').value = '';
    document.getElementById('userType').value = 'citizen';
    toggleAccessCode();
}

// Вход в систему
function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showAlert('loginAlert', 'Введите email и пароль', 'error');
        return;
    }

    const user = database.users.find(u => u.email === email && u.password === password);

    if (!user) {
        showAlert('loginAlert', 'Неверный email или пароль', 'error');
        return;
    }

    currentUser = user;
    showUserInterface();
}

// Показ интерфейса пользователя
function showUserInterface() {
    document.getElementById('dashboardTab').style.display = 'block';
    document.getElementById('ideasTab').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'block';

    if (currentUser.type === 'citizen') {
        document.getElementById('submitTab').style.display = 'block';
    }

    if (currentUser.type !== 'citizen') {
        document.getElementById('adminTab').style.display = 'block';
    }

    showTab('dashboard');
    document.querySelector('.tab-btn[onclick="showTab(\'dashboard\')"]').classList.add('active');
    document.querySelector('.tab-btn[onclick="showTab(\'login\')"]').classList.remove('active');
}

// Обновление главной панели
function updateDashboard() {
    const userInfo = document.getElementById('userInfo');
    const roleNames = {
        'citizen': 'Гражданин',
        'regional': 'Региональный деятель',
        'oblast': 'Областной деятель',
        'republican': 'Республиканский деятель',
        'president': 'Президент'
    };

    userInfo.innerHTML = `
        <h3>Добро пожаловать, ${currentUser.name}!</h3>
        <p><strong>Роль:</strong> ${roleNames[currentUser.type]}</p>
        <p><strong>Email:</strong> ${currentUser.email}</p>
        <p><strong>Дата регистрации:</strong> ${new Date(currentUser.registrationDate).toLocaleDateString('ru-RU')}</p>
    `;

    const totalIdeas = database.ideas.length;
    const myIdeas = database.ideas.filter(idea => idea.authorId === currentUser.id).length;
    const approvedIdeas = database.ideas.filter(idea => idea.status === 'approved').length;
    const activeIdeas = database.ideas.filter(idea => idea.status === 'review').length;

    document.getElementById('totalIdeas').textContent = totalIdeas;
    document.getElementById('myIdeas').textContent = myIdeas;
    document.getElementById('approvedIdeas').textContent = approvedIdeas;
    document.getElementById('activeIdeas').textContent = activeIdeas;

    loadRecentIdeas();
}

// Загрузка последних идей
function loadRecentIdeas() {
    const recentIdeas = database.ideas
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const container = document.getElementById('recentIdeas');
    container.innerHTML = recentIdeas.map(idea => createIdeaCard(idea)).join('');
}

// Создание карточки идеи
function createIdeaCard(idea) {
    const statusNames = {
        'new': 'Новая',
        'review': 'На рассмотрении',
        'approved': 'Одобрено',
        'rejected': 'Отклонено'
    };

    const categoryNames = {
        'infrastructure': 'Инфраструктура',
        'education': 'Образование',
        'healthcare': 'Здравоохранение',
        'environment': 'Экология',
        'transport': 'Транспорт',
        'social': 'Социальные вопросы'
    };

    const canVote = currentUser && currentUser.type === 'citizen' && idea.authorId !== currentUser.id;
    const canManage = currentUser && currentUser.type !== 'citizen';
    const hasVoted = currentUser && database.votes.some(v => v.ideaId === idea.id && v.userId === currentUser.id);

    return `
        <div class="idea-card">
            <div class="idea-header">
                <div class="idea-title">${idea.title}</div>
                <div class="status-badge status-${idea.status}">${statusNames[idea.status]}</div>
            </div>
            <p style="margin-bottom: 15px; color: #6b7280;">${idea.description}</p>
            <div class="idea-meta">
                <span><strong>Категория:</strong> ${categoryNames[idea.category]}</span>
                <span><strong>Регион:</strong> ${idea.region}</span>
                <span><strong>Автор:</strong> ${idea.author}</span>
                <span><strong>Дата:</strong> ${new Date(idea.date).toLocaleDateString('ru-RU')}</span>
            </div>
            
            ${canVote ? `
                <div class="vote-section">
                    <button class="vote-btn ${hasVoted ? 'voted' : ''}" onclick="voteForIdea(${idea.id})">
                        ${hasVoted ? '✓ Проголосовано' : '👍 Поддержать'}
                    </button>
                    <span>${idea.votes || 0} голосов</span>
                </div>
            ` : `
                <div class="vote-section">
                    <span style="color: #6b7280;">${idea.votes || 0} голосов поддержки</span>
                </div>
            `}
            
            ${canManage ? `
                <div class="admin-controls">
                    <select onchange="changeIdeaStatus(${idea.id}, this.value)">
                        <option value="">Изменить статус</option>
                        <option value="review" ${idea.status === 'review' ? 'selected' : ''}>На рассмотрении</option>
                        <option value="approved" ${idea.status === 'approved' ? 'selected' : ''}>Одобрить</option>
                        <option value="rejected" ${idea.status === 'rejected' ? 'selected' : ''}>Отклонить</option>
                    </select>
                    <button class="btn" style="font-size: 12px; padding: 6px 12px;" onclick="addComment(${idea.id})">Добавить комментарий</button>
                </div>
            ` : ''}
        </div>
    `;
}

// Загрузка всех идей
function loadAllIdeas() {
    filterIdeas();
}

// Фильтрация идей
function filterIdeas() {
    const statusFilter = document.getElementById('filterStatus').value;
    const categoryFilter = document.getElementById('filterCategory').value;

    let filteredIdeas = database.ideas;

    if (statusFilter !== 'all') {
        filteredIdeas = filteredIdeas.filter(idea => idea.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
        filteredIdeas = filteredIdeas.filter(idea => idea.category === categoryFilter);
    }

    const container = document.getElementById('allIdeas');
    container.innerHTML = filteredIdeas
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(idea => createIdeaCard(idea))
        .join('');
}

// Подача новой идеи
function submitIdea() {
    const title = document.getElementById('ideaTitle').value;
    const category = document.getElementById('ideaCategory').value;
    const description = document.getElementById('ideaDescription').value;
    const region = document.getElementById('ideaRegion').value;

    if (!title || !description) {
        showAlert('submitAlert', 'Заполните все обязательные поля', 'error');
        return;
    }

    const idea = {
        id: Date.now(),
        title,
        category,
        description,
        region,
        status: 'new',
        author: currentUser.name,
        authorId: currentUser.id,
        date: new Date().toISOString(),
        votes: 0
    };

    database.ideas.push(idea);
    saveDatabase();

    showAlert('submitAlert', 'Идея успешно подана! Она будет рассмотрена государственными органами.', 'success');

    document.getElementById('ideaTitle').value = '';
    document.getElementById('ideaDescription').value = '';
}

// Голосование за идею
function voteForIdea(ideaId) {
    const existingVote = database.votes.find(v => v.ideaId === ideaId && v.userId === currentUser.id);

    if (existingVote) {
        database.votes = database.votes.filter(v => !(v.ideaId === ideaId && v.userId === currentUser.id));
        const idea = database.ideas.find(i => i.id === ideaId);
        if (idea) idea.votes = (idea.votes || 1) - 1;
    } else {
        database.votes.push({
            id: Date.now(),
            ideaId,
            userId: currentUser.id,
            date: new Date().toISOString()
        });
        const idea = database.ideas.find(i => i.id === ideaId);
        if (idea) idea.votes = (idea.votes || 0) + 1;
    }

    saveDatabase();

    if (document.getElementById('dashboard').classList.contains('active')) {
        loadRecentIdeas();
    }
    if (document.getElementById('ideas').classList.contains('active')) {
        filterIdeas();
    }
}

// Изменение статуса идеи (для администраторов)
function changeIdeaStatus(ideaId, newStatus) {
    if (!newStatus) return;

    const idea = database.ideas.find(i => i.id === ideaId);
    if (idea) {
        idea.status = newStatus;
        idea.lastUpdated = new Date().toISOString();
        idea.updatedBy = currentUser.name;
        saveDatabase();

        if (document.getElementById('admin').classList.contains('active')) {
            loadAdminPanel();
        }
        if (document.getElementById('ideas').classList.contains('active')) {
            filterIdeas();
        }
    }
}

// Добавление комментария администратора
function addComment(ideaId) {
    const comment = prompt('Введите комментарий:');
    if (!comment) return;

    const commentObj = {
        id: Date.now(),
        ideaId,
        authorId: currentUser.id,
        author: currentUser.name,
        text: comment,
        date: new Date().toISOString()
    };

    database.comments.push(commentObj);
    saveDatabase();

    alert('Комментарий добавлен');
}

// Загрузка панели администрирования
function loadAdminPanel() {
    const ideas = database.ideas.sort((a, b) => new Date(b.date) - new Date(a.date));
    const container = document.getElementById('adminIdeas');
    container.innerHTML = ideas.map(idea => createIdeaCard(idea)).join('');
}

// Выход из системы
function logout() {
    currentUser = null;

    document.getElementById('dashboardTab').style.display = 'none';
    document.getElementById('ideasTab').style.display = 'none';
    document.getElementById('submitTab').style.display = 'none';
    document.getElementById('adminTab').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';

    showTab('login');
    document.querySelector('.tab-btn[onclick="showTab(\'login\')"]').classList.add('active');
}

// Показ уведомлений
function showAlert(containerId, message, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;

    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initApp);