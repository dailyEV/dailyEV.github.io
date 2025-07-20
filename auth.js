
const SB = supabase.createClient(
	'https://nkdhryqpiulrepmphwmt.supabase.co',
	'sb_publishable_mMniM5v3auOHfF72hlVL_w_LUNlh3yt'
);

/*
SB.auth.onAuthStateChange((event, session) => {
	if (event == "SIGNED_IN") {
		upsertProfile(session);
	}
})
*/

async function anon_login() {
	//const {data, error} = await sb.auth.signInAnonymously();
	const {data, error} = await SB.auth.signInWithOtp({email: "intersectinglines7@gmail.com"});
	console.log(data, error);
}

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
		.select('tier')
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
		document.querySelector("#upgrade").style.display = "none";
	}
	document.querySelector("#username").innerText = `${t} ${session.user.email}`;
}

(async function handleSession() {
	const { data: { session }, error } = await SB.auth.getSession();
	if (session) {
		console.log(session);

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
	const url = `http://localhost:5000/api/checkout?user=${session.user.id}&tier=${tier}`;
	const response = await fetch(url, { method: 'POST' });
	const data = await response.json();
	if (data.url) {
		window.location.href = data.url; // Redirect to Stripe Checkout
	} else {
		alert('Error starting checkout');
	}
}