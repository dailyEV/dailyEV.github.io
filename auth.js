
const SB = supabase.createClient(
	'https://nkdhryqpiulrepmphwmt.supabase.co',
	'sb_publishable_mMniM5v3auOHfF72hlVL_w_LUNlh3yt'
);

async function logout() {
	await SB.auth.signOut();
	location.reload();
}

async function login() {
	const email = document.getElementById("email").value;
	if (!email) {
		document.getElementById('status').textContent = 'Enter an email first!';
		return;
	}

	document.getElementById('status').textContent = 'Sending magic link...';

	const { data, error } = await SB.auth.signInWithOtp({
		email,
		options: {
			emailRedirectTo: `http://localhost:3000/feed.html`
		}
	});
	if (error) {
		console.error(error);
		document.getElementById('status').textContent = 'Error: ' + error.message;
		return;
	}

	document.getElementById('status').textContent = 'Check your email for the sign-in link!';
}

async function upsertProfile(session) {
	const { data, error } = await SB.from('profiles')
		.select('tier, discord_username, next_renewal')
		.eq('id', session.user.id)
		.maybeSingle();
	let tier = "free";
	if (!data) {
		await SB.from('profiles').insert([{ id: session.user.id, tier: tier }]);
	} else {
		tier = data.tier;
	}
	let t = "🆓";
	if (tier == "premium") {
		t = "⭐";
	} else if (tier == "vip") {
		t = "👑";
	}

	if (tier != "vip") {
		document.querySelector("#upgrade").style.display = "initial";
	}
	//document.querySelector(".profile-badge").innerText = t;
	document.querySelector("#username").innerHTML = `${t} ${session.user.email}`;
	if (window.location.pathname.includes("/profile")) {
		if (data.discord_username) {
			document.querySelector("#discord_username").innerText = data.discord_username;
		}
		if (data.next_renewal) {
			let d = new Date(data.next_renewal);
			const options = {year: 'numeric', month: 'short', day: 'numeric'};
			document.querySelector("#next_renewal").innerText = d.toLocaleDateString("en-US", options);
		}
	}
}

(async function handleSession() {
	const { data: { session }, error } = await SB.auth.getSession();
	if (session) {
		//console.log(session);
		if (session.access_token) {
			ACCESS_TOKEN = session.access_token;
		}
		document.getElementById("login").style.display = "none";
		document.getElementById("email").style.display = "none";
		document.getElementById("username").innerText = `${session.user.email}`;
		// make sure row exists in profile
		upsertProfile(session);
	} else {
		// No Session
		document.querySelectorAll(".loggedIn").map(x => x.style.display = "none");
	}
})();

document.getElementById("email").addEventListener("keypress", function(e) {
	if (e.key == "Enter") {
		e.preventDefault();
		login();
	}
});

async function upgrade(tier) {
	const { data: { session }, error } = await SB.auth.getSession();
	const url = `http://localhost:5000/api/stripe-portal`;
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${ACCESS_TOKEN}`
		}
	});
	const data = await response.json();
	if (data.url) {
		window.location.href = data.url;
	} else {
		alert('Error starting checkout');
	}
}

async function upgrade2(tier) {
	const { data: { session }, error } = await SB.auth.getSession();
	const url = `http://localhost:5000/api/checkout?user=${session.user.id}&tier=${tier}`;
	const response = await fetch(url, { method: 'POST' });
	const data = await response.json();
	if (data.url) {
		window.location.href = data.url;
	} else {
		alert('Error starting checkout');
	}
}