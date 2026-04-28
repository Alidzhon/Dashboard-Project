document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM полностью загружен. Инициализация...");

    const btn = document.getElementById('add-employee-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            document.getElementById('add-employee-panel').classList.add('open');
        });
    }
    
    // ... остальной код

    // --- Элементы управления ---
const navProjects = document.getElementById('nav-projects');
const navEmployees = document.getElementById('nav-employees');
const projectsContent = document.getElementById('projects-content');
const employeesContent = document.getElementById('employees-content');
const addEmployeeBtn = document.getElementById('add-employee-btn');
const addEmployeePanel = document.getElementById('add-employee-panel');
const cancelEmployeeBtn = document.getElementById('cancel-btn-form'); 
const employeeForm = document.getElementById('add-employee-form');
const addBtnForm = document.getElementById('add-btn-form');

// --- 1. Переключение вкладок (Navigation) ---
function switchTab(tab) {
    if (tab === 'projects') {
        projectsContent.classList.remove('hidden');
        employeesContent.classList.add('hidden');
        navProjects.classList.add('active');
        navEmployees.classList.remove('active');
    } else {
        projectsContent.classList.add('hidden');
        employeesContent.classList.remove('hidden');
        navProjects.classList.remove('active');
        navEmployees.classList.add('active');
    }
}

navProjects.addEventListener('click', (e) => { e.preventDefault(); switchTab('projects'); });
navEmployees.addEventListener('click', (e) => { e.preventDefault(); switchTab('employees'); });

// --- 2. Управление правой панелью ---
addEmployeeBtn.addEventListener('click', () => {
    addEmployeePanel.classList.add('open');
});

cancelEmployeeBtn.addEventListener('click', () => {
    addEmployeePanel.classList.remove('open');
    employeeForm.reset();
});

// --- 3. Валидация формы в реальном времени ---
employeeForm.addEventListener('input', () => {
    // Кнопка "Add" активна только если вся форма валидна
    addBtnForm.disabled = !employeeForm.checkValidity();
    
    // Пример ручной проверки возраста (минимум 18 лет)
    const dobInput = document.getElementById('dob');
    const dobError = document.getElementById('dob-error');
    if (dobInput.value) {
        const birthDate = new Date(dobInput.value);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        if (age < 18) {
            dobInput.setCustomValidity("Invalid");
            dobError.classList.add('show');
        } else {
            dobInput.setCustomValidity("");
            dobError.classList.remove('show');
        }
    }
});

// --- 4. Обработка отправки формы ---
employeeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(employeeForm);
    const newEmployee = Object.fromEntries(formData.entries());
    
    console.log('Новый сотрудник:', newEmployee);
    
    // Здесь будет ваша логика добавления в таблицу/базу
    
    addEmployeePanel.classList.remove('open');
    employeeForm.reset();
    addBtnForm.disabled = true;
});


const STORAGE_KEY = 'dashboard_data';

// --- Инициализация состояния ---
let appState = {
    monthlyData: JSON.parse(localStorage.getItem(STORAGE_KEY)) || {},
    currentPeriod: "" 
};

// --- 5 баллов: Сохранение в localStorage ---
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.monthlyData));
}

// --- 5 баллов: Переключение месяцев через селекторы ---
function syncPeriod() {
    const year = document.getElementById('year-select').value;
    const month = document.getElementById('month-select').value;
    appState.currentPeriod = `${year}-${month}`;
    
    // 5 баллов: Независимость данных (создаем пустой слепок, если месяца нет)
    if (!appState.monthlyData[appState.currentPeriod]) {
        appState.monthlyData[appState.currentPeriod] = { projects: [], employees: [] };
    }
    
    renderAll(); // Ваша функция отрисовки таблиц
}

// --- 5 баллов: Функция «Seed Data» (копирование) ---
document.getElementById('seed-data-btn').addEventListener('click', () => {
    const yearSelect = document.getElementById('year-select');
    const monthSelect = document.getElementById('month-select');
    
    // Спрашиваем у пользователя, из какого месяца копировать (упрощенно)
    const sourcePeriod = prompt("Введите период для копирования (например, 2026-0):", "2026-0");
    
    if (!appState.monthlyData[sourcePeriod]) {
        alert("Данные за указанный период не найдены!");
        return;
    }

    // Глубокое копирование (чтобы изменения не влияли друг на друга)
    const newData = JSON.parse(JSON.stringify(appState.monthlyData[sourcePeriod]));

    // --- 5 баллов: Списание отпускных дней при копировании ---
    newData.employees.forEach(emp => {
        emp.vacationDays = 0; // Списываем/обнуляем отпуска в новом периоде
    });

    appState.monthlyData[appState.currentPeriod] = newData;
    
    saveData();
    renderAll();
    alert(`Данные из ${sourcePeriod} скопированы в текущий месяц!`);
});

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    syncPeriod();
    document.getElementById('month-select').addEventListener('change', syncPeriod);
    document.getElementById('year-select').addEventListener('change', syncPeriod);
});


function renderEmployeesTable() {
    const data = appState.monthlyData[appState.currentPeriod];
    const tbody = document.querySelector('#employees-table tbody');
    tbody.innerHTML = '';

    data.employees.forEach(emp => {
        const tr = document.createElement('tr');
        
        // Расчет выплаты (минимум 50% от зарплаты)
        const effectiveAllocation = Math.max(0.5, emp.allocation || 0);
        const payment = emp.salary * effectiveAllocation;

        tr.innerHTML = `
            <td>${emp.name}</td>
            <td>${emp.surname}</td>
            <td>${emp.age}</td>
            <td>${emp.position}</td>
            <td>$${emp.salary.toLocaleString()}</td>
            <td>$${payment.toLocaleString()}</td>
            <td>${emp.projectId || '—'}</td>
            <td>${emp.vacationDays || 0} дн.</td>
            <td>
                <button class="assign-btn" onclick="editVacation('${emp.id}')">🏖 Отпуск</button>
                <button class="delete-btn" onclick="deleteEmployee('${emp.id}')">🗑</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.editVacation = function(empId) {
    const data = appState.monthlyData[appState.currentPeriod];
    const employee = data.employees.find(e => e.id === empId);
    
    if (employee) {
        const days = prompt(`Введите количество дней отпуска для ${employee.name} (текущее: ${employee.vacationDays || 0}):`, employee.vacationDays || 0);
        
        if (days !== null) {
            const numDays = parseInt(days);
            if (!isNaN(numDays) && numDays >= 0 && numDays <= 31) {
                employee.vacationDays = numDays;
                
                saveData();      // Сохраняем в localStorage (5 баллов)
                renderAll();     // Пересчитываем доходы и мощности
            } else {
                alert("Пожалуйста, введите число от 0 до 31");
            }
        }
    }
};

window.deleteEmployee = function(empId) {
    if (confirm('Удалить сотрудника из текущего месяца?')) {
        const data = appState.monthlyData[appState.currentPeriod];
        data.employees = data.employees.filter(e => e.id !== empId);
        saveData();
        renderAll();
    }
};
});