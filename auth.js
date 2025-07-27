
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
	if (tier == "analyst") {
		t = "💻";
	} else if (tier == "sharp") {
		t = "🎯";
	}

	if (tier != "sharp" && document.querySelector("#upgrade")) {
		document.querySelector("#upgrade").style.display = "initial";
	}
	//document.querySelector(".profile-badge").innerText = t;
	if (document.querySelector(".profile-badge")) {
		for (el of document.querySelectorAll(".profile-badge")) {
			el.innerText = t;
		}
	}
	if (document.getElementById("username")) {
		document.getElementById("username").innerText = `${t} ${session.user.email}`;
	}
	if (window.location.pathname.includes("/profile")) {
		fillProfile(data, tier, session);
	} else if (window.location.pathname.includes("/pricing")) {
		fillPricing(tier);
	}
}

const tierOrder = {
  free: 0,
  analyst: 1,
  sharp: 2
};

function fillPricing(tier) {
	const currentLevel = tierOrder[tier];

	document.querySelectorAll('.pricing-card').forEach(card => {
	  const btn = card.querySelector('.select-btn');
	  const btnText = btn.querySelector(".btn-text");
	  if (!btn) return;
	  const cardTier = card.dataset.tier;
	  const cardLevel = tierOrder[cardTier];

	  if (cardTier === tier) {
	    btnText.textContent = 'Current';
	    btn.disabled = true;
	    btn.classList.add('current-btn');
	  } else if (cardLevel < currentLevel) {
	  	btnText.textContent = 'Downgrade';
		btn.disabled = false;
		btn.classList.remove('current-btn');
	  } else {
	    btnText.textContent = 'Upgrade';
	    btn.disabled = false;
	    btn.classList.remove('current-btn');
	  }
	});
}

function fillProfile(data, tier, session) {
	if (document.querySelector("#profile-username")) {
		document.querySelector("#profile-username").innerText = `${session.user.email}`;
	}
	if (document.querySelector("#profile-plan")) {
		document.querySelector("#profile-plan").innerText = `${title(tier)}`;
	}
	if (document.querySelector("#discord-username") && data.discord_username) {
		document.querySelector("#discord-username").innerText = data.discord_username;
	}
	if (data.next_renewal) {
		let d = new Date(data.next_renewal);
		const options = {year: 'numeric', month: 'short', day: 'numeric'};
		document.querySelector("#next-renewal").innerText = d.toLocaleDateString("en-US", options);
	}
}

(async function handleSession() {
	const { data: { session }, error } = await SB.auth.getSession();
	if (session) {
		//console.log(session);
		if (session.access_token) {
			ACCESS_TOKEN = session.access_token;
		}
		if (document.getElementById("login")) {
			document.getElementById("login").style.display = "none";
			document.getElementById("email").style.display = "none";
		}
		Array.from(document.querySelectorAll(".loggedOut")).map(x => x.style.display = "none");
		// make sure row exists in profile
		await upsertProfile(session);

	} else {
		// No Session
		Array.from(document.querySelectorAll(".loggedIn")).map(x => x.style.display = "none");
	}
	if (PAGE == "bvp") {
		fetchBVPData();
	} else if (PAGE == "stats") {
		fetchStatsData();
	}
})();

if (document.getElementById("email")) {
	document.getElementById("email").addEventListener("keypress", function(e) {
		if (e.key == "Enter") {
			e.preventDefault();
			login();
		}
	});
}

async function upgrade(tier) {
	const response = await fetch(`${API_BASE}/api/stripe-portal`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${ACCESS_TOKEN}`
		}
	});
	const data = await response.json();
	if (data.url) {
		window.location.href = data.url;
	} else {
		alert('Error starting checkout. Contact evsharps@gmail.com');
	}
}