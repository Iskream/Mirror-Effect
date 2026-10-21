const checkbox = document.getElementById('concordo');
const iniciar = document.getElementById('iniciar');

checkbox.addEventListener('click', () => {
    iniciar.disabled =! concordo.checked;
});

iniciar.addEventListener('click', () => {
    if (concordo.checked) {
        window.location.href = "nó1.html";
    }
});

