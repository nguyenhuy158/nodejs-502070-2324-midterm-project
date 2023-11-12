/* eslint-disable no-undef */
$(() => {
	const container = $('#container');
	const registerBtn = $('#register');
	const loginBtn = $('#login');

	registerBtn.on('click', () => {
		container.addClass('active');
	});

	loginBtn.on('click', () => {
		container.removeClass('active');
	});

	$('.form-container.sign-up').on('submit', (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);

		$.ajax({
			url: "/register",
			type: "POST",
			data: {
				name: formData.get('name'),
				email: formData.get('email'),
				password: formData.get('password'),
				passwordConfirmation: formData.get('passwordConfirmation'),
				_csrf: formData.get('_csrf'),
			},
			success: (result) => {
				console.log(`🚀 🚀 file: login.js:34 🚀 result`, result);
				console.log(`🚀 🚀 file: login.js:34 🚀 result.message`, result.message);
				showToast(result.error, result.message);
				if (!result.error) {
					e.target.reset();
				}
			},
			error: (error) => {
				console.log(`🚀 🚀 file: login.js:38 🚀 error`, error);
				showToast(error.responseJSON?.error, error.responseJSON?.message);
			}
		});
	});
});
