var countdownInterval = null;

function startCountdown(seconds) {
    var message = document.getElementById("message");
    var btn = document.getElementById("loginBtn");

    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    btn.disabled = true;
    message.className = "error";
    message.textContent = "Hesabiniz bloklanib! " + seconds + " saniye sonra yeniden cehd edin.";

    countdownInterval = setInterval(function() {
        seconds--;
        if (seconds <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            btn.disabled = false;
            message.className = "success";
            message.textContent = "Blok acildi! Yeniden cehdredin.";
        } else {
            message.textContent = "Hesabiniz bloklanib! " + seconds + " saniye sonra yeniden cehdredin.";
        }
    }, 1000);
}

document.getElementById("loginBtn").addEventListener("click", function() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var message = document.getElementById("message");

    if (username === "" || password === "") {
        message.textContent = "Zehmet olmasa butun xanalari doldurun!";
        message.className = "error";
        return;
    }

    fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(function(res) {
        return res.json();
    })
    .then(function(data) {
        var msg = data.message;
        if (msg === "Ugurla daxil oldunuz!") {
            message.className = "success";
            message.textContent = msg;
            setTimeout(function() {
                window.location.href = "dashboard.html";
            }, 1000);
        } else if (msg.indexOf("BLOCKED:") === 0) {
            var seconds = parseInt(msg.substring(8));
            startCountdown(seconds);
        } else {
            message.className = "error";
            message.textContent = msg;
        }
    })
    .catch(function(err) {
        message.textContent = "Server ile elaqe xetasi!";
        message.className = "error";
    });
});

document.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        document.getElementById("loginBtn").click();
    }
});
