
const translations = {
    en: {
        home: "Home",
        caseComp: "Case Competitions",
        hackathons: "Hackathons",
        internships: "Internships",
        essays: "Essay Competitions",
        mel: "My Extra Network",
        meta: "META",
        aboutUs: "About Us"
    },
    ru: {
        home: "Главная",
        caseComp: "Кейс-чемпионаты",
        hackathons: "Хакатоны",
        internships: "Стажировки",
        essays: "Конкурсы эссе",
        mel: "My Extra Network",
        meta: "META",
        aboutUs: "О нас"
    },
    kz: {
        home: "Басты бет",
        caseComp: "Кейс-чемпионаттар",
        hackathons: "Хакатондар",
        internships: "Тағылымдамалар",
        essays: "Эссе байқаулары",
        mel: "My Extra Network",
        meta: "META",
        aboutUs: "Біз туралы"
    }
};

function changeLanguage(lang) {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

function changeTheme(theme) {
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
}

function handleLogin(event) {
    event.preventDefault();
    console.log('Login submitted');
}

function showRegistrationPopup() {
    const popup = document.getElementById('registrationPopup');
    popup.style.display = 'block';
}

function switchForm(formType) {
    const buttons = document.querySelectorAll('.registration-tabs button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const form = document.querySelector(`form[data-form-type="${formType}"]`);
    document.querySelectorAll('.popup form').forEach(f => f.style.display = 'none');
    form.style.display = 'block';
}

function closePopup() {
    const popup = document.getElementById('registrationPopup');
    popup.style.display = 'none';
}

async function handleRegistration(event) {
    event.preventDefault();
    const form = event.target;
    const formType = form.getAttribute('data-form-type') || 'general';
    
    try {
        const formData = {
            formType: formType,
            name: form.querySelector('input[placeholder*="Имя"]').value.trim(),
            city: form.querySelector('input[placeholder*="Город"]').value.trim(),
            school: form.querySelector('input[placeholder*="Школа"]').value.trim(),
            class: form.querySelector('input[placeholder*="Класс"]').value.trim(),
            email: form.querySelector('input[type="email"]').value.trim(),
            whatsapp: form.querySelector('input[placeholder*="WhatsApp"]').value.trim()
        };

        // Validate all fields are filled
        for (const [key, value] of Object.entries(formData)) {
            if (!value) {
                alert(`Пожалуйста, заполните поле ${key}`);
                return;
            }
        }

        console.log('Submitting form:', formType, formData);

        const response = await fetch('/api/submit-application', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        if (result.success) {
            alert('Заявка успешно отправлена!');
            form.reset();
            if (typeof closePopup === 'function') {
                closePopup();
            }
        } else {
            alert(`Ошибка: ${result.error || 'Произошла ошибка при отправке заявки'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка соединения с сервером. Пожалуйста, попробуйте позже.');
    }
}

document.getElementById('mel-form')?.addEventListener('submit', function(event) {
    event.preventDefault();
    console.log('MEL form submitted');
});
