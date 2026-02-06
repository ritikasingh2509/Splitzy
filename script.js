// DOM Elements
const sections = {
    home: document.getElementById('home'),
    addFriends: document.getElementById('add-friends'),
    results: document.getElementById('results'),
    feedback: document.getElementById('feedback')
};

const navigation = {
    start: document.getElementById('btn-start'),
    addFriend: document.getElementById('btn-add-friend'),
    calculate: document.getElementById('btn-calculate'),
    finish: document.getElementById('btn-finish'),
    restart: document.getElementById('btn-restart')
};

const friendsListContainer = document.getElementById('friends-list');

// State
let friends = [];

// Navigation Functions
function switchSection(targetId) {
    // Hide all
    Object.values(sections).forEach(sec => sec.classList.add('hidden'));

    // Show target
    sections[targetId].classList.remove('hidden');
    // Re-trigger animation
    sections[targetId].classList.remove('fade-in');
    void sections[targetId].offsetWidth; // trigger reflow
    sections[targetId].classList.add('fade-in');
}

// Event Listeners - Navigation
navigation.start.addEventListener('click', () => {
    switchSection('addFriends');
});

navigation.finish.addEventListener('click', () => {
    switchSection('feedback');
});

navigation.restart.addEventListener('click', () => {
    switchSection('home');
    // Optional: clear inputs?
});

// Dynamic Friends Inputs
navigation.addFriend.addEventListener('click', () => {
    const friendRows = document.querySelectorAll('.friend-row');
    const newId = friendRows.length;

    const div = document.createElement('div');
    div.className = 'friend-row slide-in'; // We can add an animation class here
    div.setAttribute('data-id', newId);

    div.innerHTML = `
        <div class="input-group">
            <input type="text" placeholder="Friend Name" class="friend-name">
        </div>
        <div class="input-group">
            <input type="number" placeholder="Amount (₹)" class="friend-amount" min="0">
        </div>
    `;

    friendsListContainer.appendChild(div);
});

// Calculate Logic
navigation.calculate.addEventListener('click', () => {
    // 1. Collect and Validate Data
    const rows = document.querySelectorAll('.friend-row');
    friends = [];
    let isValid = true;
    let totalPaid = 0;

    // Reset borders
    rows.forEach(row => {
        const nameInput = row.querySelector('.friend-name');
        nameInput.style.borderColor = '#EEE';
    });

    rows.forEach(row => {
        const nameInput = row.querySelector('.friend-name');
        const amountInput = row.querySelector('.friend-amount');

        const name = nameInput.value.trim();
        const amount = parseFloat(amountInput.value) || 0;

        if (!name) {
            isValid = false;
            nameInput.style.borderColor = 'red'; // Visual feedback
        } else {
            friends.push({ name, paid: amount });
            totalPaid += amount;
        }
    });

    if (!isValid) {
        // Simple shake animation or alert could go here
        alert("Please enter names for all friends!");
        return;
    }

    if (friends.length < 2) {
        alert("You need at least two friends to split a bill!");
        return;
    }

    // 2. Perform Calculations
    const splitAmount = totalPaid / friends.length;

    // Display Headings
    document.getElementById('total-amount').textContent = `₹${totalPaid.toFixed(2)}`;
    document.getElementById('split-amount').textContent = `₹${splitAmount.toFixed(2)}`;

    const resultsContainer = document.getElementById('results-list');
    resultsContainer.innerHTML = ''; // Clear previous

    // Prepare balances: (Paid - SplitAmount). 
    // Positive = Owed to them (Receiver). Negative = Owes others (Giver).
    let balances = friends.map(f => ({
        name: f.name,
        balance: f.paid - splitAmount
    }));

    // Separate into Givers (owes money) and Receivers (is owed money)
    // We sort them by magnitude to optimize transactions (greedy approach)
    let givers = balances.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance); // Ascending (most negative first)
    let receivers = balances.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance); // Descending (most positive first)
    let settlements = [];

    // Greedy matching
    let i = 0; // giver index
    let j = 0; // receiver index

    while (i < givers.length && j < receivers.length) {
        let giver = givers[i];
        let receiver = receivers[j];

        // The amount to settle is the minimum of what the giver owes and what the receiver is owed
        let amount = Math.min(Math.abs(giver.balance), receiver.balance);

        // Round to 2 decimals
        amount = Math.round(amount * 100) / 100;

        if (amount > 0) {
            settlements.push(`${giver.name} pays ${receiver.name} &#8377;${amount.toFixed(2)}`);
        }

        // Adjust balances
        giver.balance += amount;
        receiver.balance -= amount;

        // Move pointers if settled (within small epsilon for float errors)
        if (Math.abs(giver.balance) < 0.01) i++;
        if (receiver.balance < 0.01) j++;
    }

    // 3. Render Results
    if (settlements.length === 0) {
        resultsContainer.innerHTML = '<div class="result-item">No payments needed! Everyone paid equally.</div>';
    } else {
        settlements.forEach(text => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = text; // Safe here as text is constructed from trusted vars
            resultsContainer.appendChild(div);
        });
    }

    // Render those who don't need to do anything (balanced roughly 0)
    // Optional: Only if you want to explicitly state "X is all good"
    /*
    balances.forEach(b => {
        if (Math.abs(b.balance) < 0.01 && b.paid > 0) {
             // settled...
        }
    });
    */

    switchSection('results');
});


// Modal Logic
const modal = document.getElementById('modal-account');
const btnCreateAccount = document.getElementById('btn-create-account');
const btnCloseModal = document.getElementById('btn-close-modal');

if (btnCreateAccount && modal && btnCloseModal) {
    btnCreateAccount.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.remove('hidden');
    });

    btnCloseModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Close on clicking outside the content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}
