function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const csrfToken = getCookie("XSRF-TOKEN");
const csrfHeader = 'X-XSRF-TOKEN';

async function loadCurrentUser() {
    try {
        const response = await fetch('/api/user', {
            headers: {
                [csrfHeader]: csrfToken
            }
        });
        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Ошибка загрузки текущего пользователя:', error);
        throw error;
    }
}

async function loadAllUsers() {
    try {
        const response = await fetch('/api/admin', {  // Используем тот же endpoint, что и в admin.html
            headers: {
                [csrfHeader]: csrfToken
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки списка пользователей');
        }

        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки списка пользователей:', error);
        alert('Ошибка загрузки списка пользователей');
        return [];
    }
}

function displayCurrentUserNavbar(user) {
    document.getElementById('currentUsername').textContent = user.username;
    document.getElementById('currentUserRoles').textContent = user.roles.map(r => r.name).join(', ');
}

function displayCurrentUserTable(user) {
    const userTableBody = document.getElementById('userTableBody');
    if (userTableBody) {
        userTableBody.innerHTML = `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.lastname}</td>
                <td>${user.age}</td>
                <td>${user.email}</td>
                <td>${user.roles.map(r => r.name).join(', ')}</td>
            </tr>
        `;
    }
}

function displayAllUsers(users) {
    const usersTableBody = document.getElementById('usersTableBody') || document.getElementById('allUsersTableBody');
    if (!usersTableBody) {
        console.warn("Элемент для отображения пользователей не найден на странице.");
        return;
    }

    let tableHTML = '';
    users.forEach(user => {
        tableHTML += `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.lastname}</td>
                <td>${user.age}</td>
                <td>${user.email}</td>
                <td>${user.roles.map(r => r.name).join(', ')}</td>
                <td>
                    <button class="btn btn-primary btn-sm edit-btn"
                            data-id="${user.id}">Edit</button>
                </td>
                <td>
                    <button class="btn btn-danger btn-sm delete-btn"
                            data-id="${user.id}">Delete</button>
                </td>
            </tr>
        `;
    });

    usersTableBody.innerHTML = tableHTML;
}


document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await loadCurrentUser();
        displayCurrentUserNavbar(user);

        if (document.getElementById('userTableBody')) {
            displayCurrentUserTable(user);
        }

        if (document.getElementById('usersTableBody')) {
            const allUsers = await loadAllUsers();
            displayAllUsers(allUsers);
            setupAddUserForm();
            setupEditButtons();
            setupEditForm();
            setupDeleteButtons(); // Добавляем обработчик кнопок удаления
        }

        const adminBtn = document.getElementById('adminBtn');
        if (adminBtn) {
            const isAdmin = user.roles.some(role => role.name === 'ADMIN');
            adminBtn.style.display = isAdmin ? 'block' : 'none';
        }
    } catch (error) {
        console.error("Ошибка инициализации:", error);
        alert('Ошибка загрузки данных пользователя');
    }
});
async function setupAddUserForm() {
    const form = document.getElementById('addUserForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const roles = Array.from(formData.getAll('roles')).map(id => ({ id: parseInt(id) }));

        const userData = {
            username: formData.get('username'),
            lastname: formData.get('lastname'),
            age: parseInt(formData.get('age')),
            email: formData.get('email'),
            password: formData.get('password'),
            roles: roles
        };

        try {
            const response = await fetch('/api/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [csrfHeader]: csrfToken
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const allUsers = await loadAllUsers();
                displayAllUsers(allUsers);
                form.reset();
                alert('Пользователь успешно добавлен');
            } else {
                const error = await response.text();
                throw new Error(error);
            }
        } catch (error) {
            console.error('Ошибка добавления пользователя:', error);
            alert(`Ошибка добавления пользователя: ${error.message}`);
        }
    });
}
async function setupEditButtons() {
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const userId = e.target.dataset.id;
            await openEditModal(userId);
        }
    });
}

async function openEditModal(userId) {
    try {
        const response = await fetch(`/api/admin/${userId}`, {
            headers: {
                [csrfHeader]: csrfToken
            }
        });
        const user = await response.json();

        // Заполнение формы
        document.getElementById('editId').value = user.id;
        document.getElementById('editUsername').value = user.username;
        document.getElementById('editLastname').value = user.lastname;
        document.getElementById('editAge').value = user.age;
        document.getElementById('editEmail').value = user.email;

        // Выбор ролей
        const roleSelect = document.getElementById('editRoles');
        Array.from(roleSelect.options).forEach(option => {
            option.selected = user.roles.some(role =>
                role.id === parseInt(option.value)
            );
        });

        // Открытие модального окна
        const editModal = new bootstrap.Modal(document.getElementById('editModal'));
        editModal.show();
    } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
        alert('Ошибка загрузки данных пользователя');
    }
}

async function setupEditForm() {
    const form = document.getElementById('editUserForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const roles = Array.from(formData.getAll('roles')).map(id => ({ id: parseInt(id) }));

        const userData = {
            id: formData.get('id'),
            username: formData.get('username'),
            lastname: formData.get('lastname'),
            age: parseInt(formData.get('age')),
            email: formData.get('email'),
            roles: roles
        };

        // Добавляем пароль, только если он был изменен
        const password = formData.get('password');
        if (password) {
            userData.password = password;
        }

        try {
            const response = await fetch(`/api/admin/${userData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    [csrfHeader]: csrfToken
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const allUsers = await loadAllUsers();
                displayAllUsers(allUsers);
                const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
                editModal.hide();
                alert('Пользователь успешно обновлен');
            } else {
                const error = await response.text();
                throw new Error(error);
            }
        } catch (error) {
            console.error('Ошибка обновления пользователя:', error);
            alert(`Ошибка обновления пользователя: ${error.message}`);
        }
    });
}
// Добавьте эту функцию в app.js
async function setupDeleteButtons() {
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const userId = e.target.dataset.id;
            if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
                try {
                    const response = await fetch(`/api/admin/${userId}`, {
                        method: 'DELETE',
                        headers: {
                            [csrfHeader]: csrfToken
                        }
                    });

                    if (response.ok) {
                        const allUsers = await loadAllUsers();
                        displayAllUsers(allUsers);
                        alert('Пользователь успешно удален');
                    } else {
                        const error = await response.text();
                        throw new Error(error);
                    }
                } catch (error) {
                    console.error('Ошибка удаления пользователя:', error);
                    alert(`Ошибка удаления пользователя: ${error.message}`);
                }
            }
        }
    });
}