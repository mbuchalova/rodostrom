document.addEventListener("DOMContentLoaded", function () {
    // Get modal and close button elements
    const modal = document.getElementById("info-modal");
    const closeModalButton = document.getElementById("close-modal");

    // Add event listeners to result cards
    const resultCards = document.querySelectorAll(".result-card");
    resultCards.forEach(card => {
        card.addEventListener("click", function () {
            // Populate modal with card data
            document.getElementById("modal-name").textContent = `${card.dataset.name} ${card.dataset.surname}`;
            document.getElementById("modal-gender").textContent = `Pohlavie: ${card.dataset.gender}`;
            document.getElementById("modal-birth-date").textContent = `* ${card.dataset.birthDate}`;
            document.getElementById("modal-birth-city").textContent = `Miesto narodenia: ${card.dataset.birthCity}`;
            document.getElementById("modal-death-date").textContent = `† ${card.dataset.deathDate}`;
            document.getElementById("modal-death-city").textContent = `Miesto úmrtia: ${card.dataset.deathCity}`;

            // Show the modal
            modal.style.display = "flex";
        });
    });

    // Close the modal when the close button is clicked
    closeModalButton.addEventListener("click", function () {
        modal.style.display = "none";
    });

    // Close the modal when clicking outside of it
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});
