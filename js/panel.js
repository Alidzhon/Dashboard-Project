// Находим элементы
const addProjectBtn = document.getElementById('add-project-btn');
const addProjectPanel = document.getElementById('add-project-panel');
const cancelProjectBtn = document.getElementById('cancel-project-btn');
const projectForm = document.getElementById('add-project-form');

// Открытие панели
addProjectBtn.addEventListener('click', () => {
    addProjectPanel.classList.add('open');
});

// Закрытие панели при нажатии "Cancel"
cancelProjectBtn.addEventListener('click', () => {
    addProjectPanel.classList.remove('open');
    projectForm.reset();
});

// Обработка отправки формы
projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(projectForm);
    const newProject = Object.fromEntries(formData.entries());
    
    // Добавляем технические поля
    newProject.id = 'proj-' + Date.now();
    newProject.employees = []; // Список привязанных сотрудников
    
    // Сохраняем в текущий период
    appState.monthlyData[appState.currentPeriod].projects.push(newProject);
    
    saveData();   // Сохраняем в LocalStorage
    renderAll();  // Перерисовываем таблицы
    
    // Закрываем и очищаем
    addProjectPanel.classList.remove('open');
    projectForm.reset();
});

function renderProjectsTable() {
    const data = appState.monthlyData[appState.currentPeriod];
    const tbody = document.querySelector('#projects-table tbody');
    if (!tbody || !data.projects) return;

    tbody.innerHTML = '';

    data.projects.forEach(proj => {
        // Находим всех сотрудников, которые привязаны к этому проекту в текущем месяце
        const assignedEmployees = data.employees.filter(emp => emp.projectId === proj.projectName);
        const currentCount = assignedEmployees.length;
        
        // Расчет Estimated Income (пример: Бюджет - Сумма зарплат назначенных сотрудников)
        const totalSalaries = assignedEmployees.reduce((sum, emp) => sum + (parseFloat(emp.salary) || 0), 0);
        const estimatedIncome = parseFloat(proj.budget) - totalSalaries;

        const tr = document.createElement('tr');
        
        // Проверка на превышение вместимости (используем ваш класс .over-capacity)
        const capacityClass = currentCount > proj.capacity ? 'class="over-capacity"' : '';

        tr.innerHTML = `
            <td>${proj.companyName}</td>
            <td>${proj.projectName}</td>
            <td>$${Number(proj.budget).toLocaleString()}</td>
            <td ${capacityClass}>${currentCount} / ${proj.capacity}</td>
            <td>${assignedEmployees.map(e => e.name).join(', ') || '—'}</td>
            <td>$${estimatedIncome.toLocaleString()}</td>
            <td>
                <button onclick="deleteProject('${proj.id}')" style="background:none; border:none; cursor:pointer;">🗑</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Добавляем удаление проекта
window.deleteProject = function(projId) {
    if (confirm('Удалить проект?')) {
        const data = appState.monthlyData[appState.currentPeriod];
        data.projects = data.projects.filter(p => p.id !== projId);
        saveData();
        renderAll();
    }
};